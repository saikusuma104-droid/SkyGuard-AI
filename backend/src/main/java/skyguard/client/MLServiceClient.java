package skyguard.client;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import skyguard.dto.AnomalyResponse;
import skyguard.dto.WeatherRequest;

import java.util.HashMap;
import java.util.Map;

@Service
public class MLServiceClient {

    private final RestTemplate restTemplate = new RestTemplate();

    private final String ML_URL = "http://localhost:8000/predict";

    private final String ML_LIVE_URL = "http://localhost:8000/live-aws";

    public Object getLiveAWSData() {
        try {
            return restTemplate.getForObject(ML_LIVE_URL, Object.class);
        } catch (Exception e) {
            return null;
        }
    }

    public AnomalyResponse predict(WeatherRequest request) {
        Map<String, Object> data = new HashMap<>();

        data.put("station_id", request.getStationId());
        data.put("timestamp", request.getTimestamp() != null ? request.getTimestamp() : "2026-08-27 12:00:00");
        data.put("temperature", request.getTemperature());
        data.put("dew_point_temperature", request.getDewPointTemperature());
        data.put("station_level_pressure", request.getStationLevelPressure() != 0 ? request.getStationLevelPressure() : 1008.5);
        data.put("sea_level_pressure", request.getSeaLevelPressure() != 0 ? request.getSeaLevelPressure() : 1010.0);
        data.put("wind_direction", request.getWindDirection());
        data.put("wind_speed", request.getWindSpeed());
        data.put("relative_humidity", request.getRelativeHumidity());
        data.put("visibility", request.getVisibility());

        try {
            return restTemplate.postForObject(
                    ML_URL,
                    data,
                    AnomalyResponse.class
            );
        } catch (Exception e) {
            // Fallback evaluation if FastAPI ML service is temporarily down
            boolean isAnomaly = request.getTemperature() > 50.0 || request.getTemperature() < -20.0 || request.getRelativeHumidity() > 100.0;
            double score = isAnomaly ? -0.15 : 0.10;
            String severity = isAnomaly ? "CRITICAL" : "NORMAL";

            return new AnomalyResponse(
                    request.getStationId(),
                    request.getTimestamp(),
                    isAnomaly,
                    score,
                    severity
            );
        }
    }
}
