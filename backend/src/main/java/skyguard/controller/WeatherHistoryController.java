package skyguard.controller;

import org.springframework.web.bind.annotation.*;
import skyguard.entity.WeatherReading;
import skyguard.service.WeatherHistoryService;

import java.util.List;

@RestController
@RequestMapping("/api/weather")
@CrossOrigin(origins = "*")
public class WeatherHistoryController {

    private final WeatherHistoryService weatherHistoryService;

    public WeatherHistoryController(WeatherHistoryService weatherHistoryService) {
        this.weatherHistoryService = weatherHistoryService;
    }

    @GetMapping("/history")
    public List<WeatherReading> getHistory(
            @RequestParam(value = "stationId", required = false) String stationId,
            @RequestParam(value = "from", required = false) String from,
            @RequestParam(value = "to", required = false) String to) {
        return weatherHistoryService.getHistory(stationId, from, to);
    }

    @GetMapping("/history/all")
    public List<WeatherReading> getAllHistory(
            @RequestParam(value = "from", required = false) String from,
            @RequestParam(value = "to", required = false) String to) {
        return weatherHistoryService.getAllHistory(from, to);
    }
}
