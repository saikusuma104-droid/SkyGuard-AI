package skyguard.controller;

import org.springframework.web.bind.annotation.*;

import skyguard.dto.AnomalyResponse;
import skyguard.dto.WeatherRequest;
import skyguard.entity.AnomalyResult;
import skyguard.repository.AnomalyResultRepository;
import skyguard.service.AnomalyDecisionService;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AnomalyController {

    private final AnomalyDecisionService anomalyDecisionService;
    private final AnomalyResultRepository anomalyResultRepository;

    public AnomalyController(
            AnomalyDecisionService anomalyDecisionService,
            AnomalyResultRepository anomalyResultRepository) {
        this.anomalyDecisionService = anomalyDecisionService;
        this.anomalyResultRepository = anomalyResultRepository;
    }

    @PostMapping({"/anomaly/check", "/anomaly/predict", "/readings/check"})
    public AnomalyResponse checkAnomaly(@RequestBody WeatherRequest request) {
        return anomalyDecisionService.processReading(request);
    }

    @GetMapping("/anomalies")
    public List<AnomalyResult> getAnomalies(
            @RequestParam(value = "stationId", required = false) String stationId,
            @RequestParam(value = "severity", required = false) String severity) {
        if (stationId != null && !stationId.trim().isEmpty() && !"all".equalsIgnoreCase(stationId)) {
            return anomalyResultRepository.findByStationIdAndAnomalyTrueOrderByTimestampDesc(stationId);
        } else if (severity != null && !severity.trim().isEmpty()) {
            return anomalyResultRepository.findBySeverityOrderByTimestampDesc(severity);
        } else {
            return anomalyResultRepository.findByAnomalyTrueOrderByTimestampDesc();
        }
    }
}
