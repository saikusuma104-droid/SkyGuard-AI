package skyguard.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sensor_health", schema = "skyguard")
public class SensorHealth {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "station_id", nullable = false, unique = true)
    private String stationId;

    private String status = "HEALTHY";

    @Column(name = "health_score")
    private Double healthScore = 100.0;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public SensorHealth() {}

    public SensorHealth(String stationId, String status, Double healthScore) {
        this.stationId = stationId;
        this.status = status;
        this.healthScore = healthScore;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStationId() {
        return stationId;
    }

    public void setStationId(String stationId) {
        this.stationId = stationId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getHealthScore() {
        return healthScore;
    }

    public void setHealthScore(Double healthScore) {
        this.healthScore = healthScore;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
