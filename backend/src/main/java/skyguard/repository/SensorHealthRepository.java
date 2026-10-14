package skyguard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import skyguard.entity.SensorHealth;

import java.util.Optional;

@Repository
public interface SensorHealthRepository extends JpaRepository<SensorHealth, Long> {
    Optional<SensorHealth> findByStationId(String stationId);
}
