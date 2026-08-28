package skyguard.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

public class WeatherRequest {

    @JsonProperty("stationId")
    @JsonAlias({"station_id", "stationId"})
    private String stationId;

    @JsonProperty("timestamp")
    private String timestamp;

    @JsonProperty("temperature")
    private double temperature;

    @JsonProperty("dewPointTemperature")
    @JsonAlias({"dew_point_temperature", "dewPointTemperature"})
    private double dewPointTemperature;

    @JsonProperty("windDirection")
    @JsonAlias({"wind_direction", "windDirection"})
    private double windDirection;

    @JsonProperty("windSpeed")
    @JsonAlias({"wind_speed", "windSpeed"})
    private double windSpeed;

    @JsonProperty("relativeHumidity")
    @JsonAlias({"relative_humidity", "relativeHumidity"})
    private double relativeHumidity;

    @JsonProperty("visibility")
    private double visibility;

    @JsonProperty("stationLevelPressure")
    @JsonAlias({"station_level_pressure", "stationLevelPressure", "pressure"})
    private double stationLevelPressure;

    @JsonProperty("seaLevelPressure")
    @JsonAlias({"sea_level_pressure", "seaLevelPressure"})
    private double seaLevelPressure;

    public String getStationId() {
        return stationId;
    }

    public void setStationId(String stationId) {
        this.stationId = stationId;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public double getTemperature() {
        return temperature;
    }

    public void setTemperature(double temperature) {
        this.temperature = temperature;
    }

    public double getDewPointTemperature() {
        return dewPointTemperature;
    }

    public void setDewPointTemperature(double dewPointTemperature) {
        this.dewPointTemperature = dewPointTemperature;
    }

    public double getWindDirection() {
        return windDirection;
    }

    public void setWindDirection(double windDirection) {
        this.windDirection = windDirection;
    }

    public double getWindSpeed() {
        return windSpeed;
    }

    public void setWindSpeed(double windSpeed) {
        this.windSpeed = windSpeed;
    }

    public double getRelativeHumidity() {
        return relativeHumidity;
    }

    public void setRelativeHumidity(double relativeHumidity) {
        this.relativeHumidity = relativeHumidity;
    }

    public double getVisibility() {
        return visibility;
    }

    public void setVisibility(double visibility) {
        this.visibility = visibility;
    }

    public double getStationLevelPressure() {
        return stationLevelPressure;
    }

    public void setStationLevelPressure(double stationLevelPressure) {
        this.stationLevelPressure = stationLevelPressure;
    }

    public double getSeaLevelPressure() {
        return seaLevelPressure;
    }

    public void setSeaLevelPressure(double seaLevelPressure) {
        this.seaLevelPressure = seaLevelPressure;
    }
}
