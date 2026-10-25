package skyguard.service;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import skyguard.entity.SensorHealth;
import skyguard.entity.Station;
import skyguard.repository.SensorHealthRepository;
import skyguard.repository.StationRepository;

import java.util.*;

@Service
public class StationService {

    private final StationRepository stationRepository;
    private final SensorHealthRepository sensorHealthRepository;

    // Official 7 AWS Stations
    public static final List<Station> INITIAL_STATIONS = Arrays.asList(
            new Station("station_01", "Tuni", 17.3615, 82.5468, 24.0, true),
            new Station("station_02", "Thiruvananthapuram", 8.4900, 76.9500, 18.0, true),
            new Station("station_03", "Tirupati", 13.6316, 79.4232, 156.0, true),
            new Station("station_04", "Nalgonda", 17.0504, 79.2669, 235.0, true),
            new Station("station_05", "Coonoor", 11.3459, 76.7965, 1746.0, true),
            new Station("station_06", "Kurnool", 15.8309, 78.0425, 286.0, true),
            new Station("station_07", "Bhadrachalam", 17.6688, 80.8940, 61.0, true)
    );

    public StationService(StationRepository stationRepository, SensorHealthRepository sensorHealthRepository) {
        this.stationRepository = stationRepository;
        this.sensorHealthRepository = sensorHealthRepository;
    }

    @PostConstruct
    public void seedStationsIfNecessary() {
        for (Station s : INITIAL_STATIONS) {
            if (stationRepository.findByStationId(s.getStationId()).isEmpty()) {
                stationRepository.save(s);
            }
            if (sensorHealthRepository.findByStationId(s.getStationId()).isEmpty()) {
                sensorHealthRepository.save(new SensorHealth(s.getStationId(), "HEALTHY", 100.0));
            }
        }
    }

    public List<Station> getAllStations() {
        List<Station> stations = stationRepository.findAll();
        if (stations.isEmpty()) {
            return INITIAL_STATIONS;
        }
        // Update health status dynamically from SensorHealth repository
        for (Station st : stations) {
            sensorHealthRepository.findByStationId(st.getStationId())
                    .ifPresent(sh -> st.setStatus(sh.getStatus()));
        }
        return stations;
    }

    public Optional<Station> getStationById(String stationId) {
        Optional<Station> st = stationRepository.findByStationId(stationId);
        if (st.isPresent()) {
            sensorHealthRepository.findByStationId(stationId)
                    .ifPresent(sh -> st.get().setStatus(sh.getStatus()));
        } else {
            // Check initial list as fallback
            return INITIAL_STATIONS.stream()
                    .filter(s -> s.getStationId().equalsIgnoreCase(stationId))
                    .findFirst();
        }
        return st;
    }
}
