package skyguard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import skyguard.entity.WeatherReading;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WeatherReadingRepository extends JpaRepository<WeatherReading, Long> {

    List<WeatherReading> findByStationIdAndTimestampBetween(String stationId, LocalDateTime start, LocalDateTime end);

    List<WeatherReading> findByTimestampBetween(LocalDateTime start, LocalDateTime end);

    List<WeatherReading> findByStationIdOrderByTimestampDesc(String stationId);

    List<WeatherReading> findByStatusAndTimestampBetweenOrderByTimestampAsc(String status, LocalDateTime start, LocalDateTime end);

    List<WeatherReading> findByStationIdAndStatusAndTimestampBetweenOrderByTimestampAsc(String stationId, String status, LocalDateTime start, LocalDateTime end);

    List<WeatherReading> findByStatusOrderByTimestampAsc(String status);

    List<WeatherReading> findByStationIdAndStatusOrderByTimestampAsc(String stationId, String status);
}
