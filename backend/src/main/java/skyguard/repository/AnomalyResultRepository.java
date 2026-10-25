package skyguard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import skyguard.entity.AnomalyResult;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnomalyResultRepository extends JpaRepository<AnomalyResult, Long> {

    List<AnomalyResult> findByStationIdOrderByTimestampDesc(String stationId);

    List<AnomalyResult> findByAnomalyTrueOrderByTimestampDesc();

    List<AnomalyResult> findByStationIdAndAnomalyTrueOrderByTimestampDesc(String stationId);

    List<AnomalyResult> findBySeverityOrderByTimestampDesc(String severity);

    List<AnomalyResult> findByStationIdAndTimestampBetweenOrderByTimestampDesc(String stationId, LocalDateTime start, LocalDateTime end);

    List<AnomalyResult> findByTimestampBetweenOrderByTimestampDesc(LocalDateTime start, LocalDateTime end);
}
