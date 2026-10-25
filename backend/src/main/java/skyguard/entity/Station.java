package skyguard.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "stations", schema = "skyguard")
public class Station {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "station_id", nullable = false, unique = true)
    private String stationId;

    @Column(name = "station_name", nullable = false)
    private String stationName;

    private Double latitude;

    private Double longitude;

    private Double elevation;

    private Boolean active = true;

    private String status = "HEALTHY";

    public Station() {}

    public Station(String stationId, String stationName, Double latitude, Double longitude, Double elevation, Boolean active) {
        this.stationId = stationId;
        this.stationName = stationName;
        this.latitude = latitude;
        this.longitude = longitude;
        this.elevation = elevation;
        this.active = active;
        this.status = "HEALTHY";
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

    public String getStationName() {
        return stationName;
    }

    public void setStationName(String stationName) {
        this.stationName = stationName;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Double getElevation() {
        return elevation;
    }

    public void setElevation(Double elevation) {
        this.elevation = elevation;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
