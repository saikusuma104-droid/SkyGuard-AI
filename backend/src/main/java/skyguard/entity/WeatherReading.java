package skyguard.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "weather_readings", schema = "skyguard")
public class WeatherReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "station_id", nullable = false)
    private String stationId;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    private Double temperature;

    @Column(name = "dew_point_temperature")
    private Double dewPointTemperature;

    @Column(name = "wind_direction")
    private Double windDirection;

    @Column(name = "wind_speed")
    private Double windSpeed;

    @Column(name = "relative_humidity")
    private Double relativeHumidity;

    private Double visibility;

    @Column(name = "station_level_pressure")
    private Double stationLevelPressure;

    @Column(name = "sea_level_pressure")
    private Double seaLevelPressure;

    private Boolean anomaly;

    @Column(name = "anomaly_score")
    private Double anomalyScore;

    private String status;

    private String severity;

    @Column(length = 1000)
    private String reason;

    @Column(name = "data_source")
    private String dataSource = "LIVE";

    public WeatherReading() {}

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

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Double getDewPointTemperature() {
        return dewPointTemperature;
    }

    public void setDewPointTemperature(Double dewPointTemperature) {
        this.dewPointTemperature = dewPointTemperature;
    }

    public Double getWindDirection() {
        return windDirection;
    }

    public void setWindDirection(Double windDirection) {
        this.windDirection = windDirection;
    }

    public Double getWindSpeed() {
        return windSpeed;
    }

    public void setWindSpeed(Double windSpeed) {
        this.windSpeed = windSpeed;
    }

    public Double getRelativeHumidity() {
        return relativeHumidity;
    }

    public void setRelativeHumidity(Double relativeHumidity) {
        this.relativeHumidity = relativeHumidity;
    }

    public Double getVisibility() {
        return visibility;
    }

    public void setVisibility(Double visibility) {
        this.visibility = visibility;
    }

    public Double getStationLevelPressure() {
        return stationLevelPressure;
    }

    public void setStationLevelPressure(Double stationLevelPressure) {
        this.stationLevelPressure = stationLevelPressure;
    }

    public Double getSeaLevelPressure() {
        return seaLevelPressure;
    }

    public void setSeaLevelPressure(Double seaLevelPressure) {
        this.seaLevelPressure = seaLevelPressure;
    }

    public Boolean getAnomaly() {
        return anomaly;
    }

    public void setAnomaly(Boolean anomaly) {
        this.anomaly = anomaly;
    }

    public Double getAnomalyScore() {
        return anomalyScore;
    }

    public void setAnomalyScore(Double anomalyScore) {
        this.anomalyScore = anomalyScore;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getDataSource() {
        return dataSource;
    }

    public void setDataSource(String dataSource) {
        this.dataSource = dataSource;
    }
}
