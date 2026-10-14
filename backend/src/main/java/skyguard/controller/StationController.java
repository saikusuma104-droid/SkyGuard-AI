package skyguard.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import skyguard.entity.Station;
import skyguard.entity.WeatherReading;
import skyguard.repository.WeatherReadingRepository;
import skyguard.service.StationService;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
@CrossOrigin(origins = "*")
public class StationController {

    private final StationService stationService;
    private final WeatherReadingRepository weatherReadingRepository;

    public StationController(StationService stationService, WeatherReadingRepository weatherReadingRepository) {
        this.stationService = stationService;
        this.weatherReadingRepository = weatherReadingRepository;
    }

    @GetMapping
    public List<Station> getStations() {
        return stationService.getAllStations();
    }

    @GetMapping("/{stationId}")
    public Station getStationById(@PathVariable("stationId") String stationId) {
        return stationService.getStationById(stationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Station not found: " + stationId));
    }

    @GetMapping("/{stationId}/latest")
    public WeatherReading getLatestReading(@PathVariable("stationId") String stationId) {
        List<WeatherReading> readings = weatherReadingRepository.findByStationIdOrderByTimestampDesc(stationId);
        if (readings == null || readings.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No sensor telemetry available for station: " + stationId);
        }
        return readings.get(0);
    }
}
