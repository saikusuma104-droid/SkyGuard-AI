package skyguard.controller;

import org.springframework.web.bind.annotation.*;

import skyguard.dto.AnomalyResponse;
import skyguard.dto.WeatherRequest;
import skyguard.service.AnomalyService;

@RestController
@RequestMapping("/api/anomaly")
@CrossOrigin(origins = "*")
public class AnomalyController {

    private final AnomalyService anomalyService;


    public AnomalyController(
            AnomalyService anomalyService) {

        this.anomalyService = anomalyService;
    }


    @GetMapping("/live")
    public Object getLiveStations() {
        return anomalyService.getLiveAWSData();
    }

    @PostMapping({"/check", "/predict"})
    public AnomalyResponse checkAnomaly(
            @RequestBody WeatherRequest request) {

        return anomalyService.checkAnomaly(request);
    }
}
