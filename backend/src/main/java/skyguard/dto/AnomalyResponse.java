package skyguard.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AnomalyResponse {

    @JsonProperty("station_id")
    private String station_id;

    @JsonProperty("timestamp")
    private String timestamp;

    @JsonProperty("anomaly")
    private boolean anomaly;

    @JsonProperty("anomaly_score")
    private double anomaly_score;

    @JsonProperty("severity")
    private String severity;

    @JsonProperty("status")
    private String status;

    @JsonProperty("confidence")
    private double confidence = 0.85;

    @JsonProperty("reason")
    private String reason;

    @JsonProperty("physical_validation")
    private Object physicalValidation;

    @JsonProperty("rule")
    private Object rule;

    @JsonProperty("ml")
    private Object ml;

    @JsonProperty("hybrid")
    private Object hybrid;

    public AnomalyResponse() {}

    public AnomalyResponse(String station_id, String timestamp, boolean anomaly, double anomaly_score, String severity) {
        this.station_id = station_id;
        this.timestamp = timestamp;
        this.anomaly = anomaly;
        this.anomaly_score = anomaly_score;
        this.severity = severity;
    }

    public String getStation_id() {
        return station_id;
    }

    public void setStation_id(String station_id) {
        this.station_id = station_id;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public boolean isAnomaly() {
        return anomaly;
    }

    public void setAnomaly(boolean anomaly) {
        this.anomaly = anomaly;
    }

    public double getAnomaly_score() {
        return anomaly_score;
    }

    public void setAnomaly_score(double anomaly_score) {
        this.anomaly_score = anomaly_score;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public Object getRule() {
        return rule;
    }

    public void setRule(Object rule) {
        this.rule = rule;
    }

    public Object getMl() {
        return ml;
    }

    public void setMl(Object ml) {
        this.ml = ml;
    }

    public Object getHybrid() {
        return hybrid;
    }

    public void setHybrid(Object hybrid) {
        this.hybrid = hybrid;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Object getPhysicalValidation() {
        return physicalValidation;
    }

    public void setPhysicalValidation(Object physicalValidation) {
        this.physicalValidation = physicalValidation;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }
}
