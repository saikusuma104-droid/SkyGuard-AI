package skyguard.service;

import org.springframework.stereotype.Service;
import skyguard.client.MLServiceClient;
import skyguard.dto.AnomalyResponse;
import skyguard.dto.WeatherRequest;
import skyguard.entity.AnomalyResult;
import skyguard.entity.SensorHealth;
import skyguard.entity.Station;
import skyguard.entity.WeatherReading;
import skyguard.repository.AnomalyResultRepository;
import skyguard.repository.SensorHealthRepository;
import skyguard.repository.WeatherReadingRepository;
import skyguard.rule.RuleEngineService;
import skyguard.rule.RuleResult;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AnomalyDecisionService {

    private final RuleEngineService ruleEngineService;
    private final MLServiceClient mlServiceClient;
    private final StationService stationService;
    private final WeatherReadingRepository weatherReadingRepository;
    private final AnomalyResultRepository anomalyResultRepository;
    private final SensorHealthRepository sensorHealthRepository;

    public AnomalyDecisionService(
            RuleEngineService ruleEngineService,
            MLServiceClient mlServiceClient,
            StationService stationService,
            WeatherReadingRepository weatherReadingRepository,
            AnomalyResultRepository anomalyResultRepository,
            SensorHealthRepository sensorHealthRepository) {
        this.ruleEngineService = ruleEngineService;
        this.mlServiceClient = mlServiceClient;
        this.stationService = stationService;
        this.weatherReadingRepository = weatherReadingRepository;
        this.anomalyResultRepository = anomalyResultRepository;
        this.sensorHealthRepository = sensorHealthRepository;
    }

    public AnomalyResponse processReading(WeatherRequest request) {
        String stationId = request.getStationId();
        if (stationId == null || stationId.trim().isEmpty()) {
            stationId = "station_01";
            request.setStationId(stationId);
        }

        // 1. Identify Station metadata
        Station station = stationService.getStationById(stationId).orElse(null);

        // 2. Retrieve recent station history (Top 10 readings for SAME station)
        List<WeatherReading> history = weatherReadingRepository.findByStationIdOrderByTimestampDesc(stationId);
        List<WeatherReading> recentHistory = history.stream().limit(10).collect(Collectors.toList());

        // 3. Rule Engine Quality-Control Evaluation
        RuleResult ruleResult = ruleEngineService.evaluate(request, station, recentHistory);

        // 4. ML Service Prediction
        AnomalyResponse mlResponse = null;
        try {
            mlResponse = mlServiceClient.predict(request);
        } catch (Exception e) {
            // Log ML service unavailability
            System.err.println("ML Service call failed or unavailable: " + e.getMessage());
        }

        // 5. Combine Rule + ML Signals
        boolean isAnomaly = false;
        String severity = "NORMAL";
        String status = "NORMAL";
        double anomalyScore = 0.0;
        double confidence = 0.85;
        List<String> combinedReasons = new ArrayList<>();

        if (ruleResult.hasViolations()) {
            combinedReasons.addAll(ruleResult.getReasons());
        }

        if (mlResponse != null) {
            anomalyScore = mlResponse.getAnomaly_score();
            confidence = mlResponse.getConfidence() > 0 ? mlResponse.getConfidence() : 0.85;

            if (mlResponse.getReason() != null && !mlResponse.getReason().isEmpty()) {
                if (!combinedReasons.contains(mlResponse.getReason()) && !"Observation is consistent with learned normal patterns".equals(mlResponse.getReason()) && !"Observation is consistent with recent station behavior and learned normal weather patterns".equals(mlResponse.getReason())) {
                    combinedReasons.add(mlResponse.getReason());
                }
            }

            // Honor Python Hybrid Detector Fusion Result
            isAnomaly = mlResponse.isAnomaly();
            severity = mlResponse.getSeverity() != null ? mlResponse.getSeverity() : "NORMAL";
            status = isAnomaly ? "ANOMALY" : ("MEDIUM".equalsIgnoreCase(severity) || "LOW".equalsIgnoreCase(severity) ? "WARNING" : "NORMAL");
        } else {
            if (ruleResult.isCritical()) {
                isAnomaly = true;
                severity = "HIGH";
                status = "ANOMALY";
            } else if (ruleResult.isWarning()) {
                isAnomaly = false;
                severity = "MEDIUM";
                status = "WARNING";
            } else {
                isAnomaly = false;
                severity = "NORMAL";
                status = "NORMAL";
            }
        }

        if (ruleResult.isCritical()) {
            isAnomaly = true;
            severity = "HIGH";
            status = "ANOMALY";
        }

        if (combinedReasons.isEmpty()) {
            combinedReasons.add("Observation is consistent with recent station behavior and learned normal weather patterns");
        }

        String finalReasonString = String.join("; ", combinedReasons);

        LocalDateTime now = LocalDateTime.now();
        boolean isDemo = "DEMO".equalsIgnoreCase(request.getDataSource());
        LocalDateTime readingTimestamp;
        if (isDemo || request.getTimestamp() == null || request.getTimestamp().trim().isEmpty()) {
            readingTimestamp = now;
        } else {
            readingTimestamp = parseTimestamp(request.getTimestamp());
        }

        // 6. Save WeatherReading to PostgreSQL
        WeatherReading reading = new WeatherReading();
        reading.setStationId(stationId);
        reading.setTimestamp(readingTimestamp);
        reading.setTemperature(request.getTemperature());
        reading.setDewPointTemperature(request.getDewPointTemperature());
        reading.setWindDirection(request.getWindDirection());
        reading.setWindSpeed(request.getWindSpeed());
        reading.setRelativeHumidity(request.getRelativeHumidity());
        reading.setVisibility(request.getVisibility());
        reading.setStationLevelPressure(request.getStationLevelPressure() > 0 ? request.getStationLevelPressure() : request.getSeaLevelPressure());
        reading.setSeaLevelPressure(request.getSeaLevelPressure());
        reading.setAnomaly(isAnomaly);
        reading.setAnomalyScore(anomalyScore);
        reading.setStatus(status);
        reading.setSeverity(severity);
        reading.setReason(finalReasonString);
        reading.setDataSource(isDemo ? "DEMO" : (request.getDataSource() != null ? request.getDataSource() : "LIVE"));

        WeatherReading savedReading = weatherReadingRepository.save(reading);

        // 7. Save Detailed AnomalyResult to PostgreSQL
        AnomalyResult anomalyResult = new AnomalyResult();
        anomalyResult.setReadingId(savedReading.getId());
        anomalyResult.setStationId(stationId);
        anomalyResult.setTimestamp(readingTimestamp);
        anomalyResult.setAnomaly(isAnomaly);
        anomalyResult.setSeverity(severity);
        anomalyResult.setAnomalyScore(anomalyScore);
        anomalyResult.setConfidence(confidence);
        anomalyResult.setReasons(finalReasonString);
        anomalyResult.setRuleFlags(String.join(",", ruleResult.getFlags()));
        anomalyResult.setMlResult(mlResponse != null ? (mlResponse.isAnomaly() ? "ANOMALY" : "NORMAL") : "UNAVAILABLE");
        anomalyResult.setCreatedAt(now);

        anomalyResultRepository.save(anomalyResult);

        // 8. Update Sensor Health State
        updateSensorHealth(stationId);

        // 9. Build Final AnomalyResponse DTO
        AnomalyResponse response = new AnomalyResponse();
        response.setStation_id(stationId);
        response.setTimestamp(readingTimestamp.toString());
        response.setAnomaly(isAnomaly);
        response.setAnomaly_score(anomalyScore);
        response.setSeverity(severity);
        response.setStatus(status);
        response.setReason(finalReasonString);
        response.setRule(ruleResult.getFlags());
        response.setMl(mlResponse);

        return response;
    }

    private void updateSensorHealth(String stationId) {
        List<WeatherReading> recent = weatherReadingRepository.findByStationIdOrderByTimestampDesc(stationId);
        if (recent.isEmpty()) return;

        int sampleSize = Math.min(recent.size(), 20);
        long normalCount = recent.stream().limit(sampleSize).filter(r -> "NORMAL".equalsIgnoreCase(r.getStatus()) || Boolean.FALSE.equals(r.getAnomaly())).count();

        double healthPercentage = ((double) normalCount / sampleSize) * 100.0;
        String status = "HEALTHY";
        if (healthPercentage < 70.0) {
            status = "CRITICAL";
        } else if (healthPercentage < 90.0) {
            status = "WARNING";
        }

        Optional<SensorHealth> healthOpt = sensorHealthRepository.findByStationId(stationId);
        SensorHealth health = healthOpt.orElseGet(() -> new SensorHealth(stationId, "HEALTHY", 100.0));
        health.setStatus(status);
        health.setHealthScore(healthPercentage);
        health.setUpdatedAt(LocalDateTime.now());
        sensorHealthRepository.save(health);
    }

    private LocalDateTime parseTimestamp(String timestampStr) {
        if (timestampStr == null || timestampStr.trim().isEmpty()) {
            return LocalDateTime.now();
        }
        String ts = timestampStr.trim();
        try {
            if (ts.contains("T")) {
                return LocalDateTime.parse(ts);
            } else if (ts.contains(" ")) {
                return LocalDateTime.parse(ts, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            } else {
                return LocalDateTime.parse(ts, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            }
        } catch (Exception e) {
            return LocalDateTime.now();
        }
    }
}
