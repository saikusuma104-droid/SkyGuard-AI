package skyguard.service;

import org.springframework.stereotype.Service;
import skyguard.entity.WeatherReading;
import skyguard.repository.WeatherReadingRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class WeatherHistoryService {

    private final WeatherReadingRepository weatherReadingRepository;

    public WeatherHistoryService(WeatherReadingRepository weatherReadingRepository) {
        this.weatherReadingRepository = weatherReadingRepository;
    }

    public List<WeatherReading> getHistory(String stationId, String fromStr, String toStr) {
        LocalDateTime start = parseFromDate(fromStr);
        LocalDateTime end = parseToDate(toStr);

        if (stationId != null && !stationId.trim().isEmpty() && !"all".equalsIgnoreCase(stationId)) {
            if (start != null && end != null) {
                return weatherReadingRepository.findByStationIdAndTimestampBetween(stationId, start, end);
            } else {
                return weatherReadingRepository.findByStationIdOrderByTimestampDesc(stationId);
            }
        } else {
            if (start != null && end != null) {
                return weatherReadingRepository.findByTimestampBetween(start, end);
            } else {
                return weatherReadingRepository.findAll();
            }
        }
    }

    public List<WeatherReading> getAllHistory(String fromStr, String toStr) {
        LocalDateTime start = parseFromDate(fromStr);
        LocalDateTime end = parseToDate(toStr);

        if (start != null && end != null) {
            return weatherReadingRepository.findByTimestampBetween(start, end);
        } else {
            return weatherReadingRepository.findAll();
        }
    }

    private LocalDateTime parseFromDate(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) return null;
        try {
            LocalDate date = LocalDate.parse(dateStr.trim(), DateTimeFormatter.ISO_LOCAL_DATE);
            return date.atStartOfDay();
        } catch (Exception e) {
            return null;
        }
    }

    private LocalDateTime parseToDate(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) return null;
        try {
            LocalDate date = LocalDate.parse(dateStr.trim(), DateTimeFormatter.ISO_LOCAL_DATE);
            return date.atTime(LocalTime.MAX);
        } catch (Exception e) {
            return null;
        }
    }

    public byte[] generateDownloadFile(String stationId, String fromStr, String toStr, String format) {
        LocalDateTime start = parseFromDate(fromStr);
        LocalDateTime end = parseToDate(toStr);

        List<WeatherReading> records;
        String normalStatus = "NORMAL";

        if (stationId != null && !stationId.trim().isEmpty() && !"all".equalsIgnoreCase(stationId)) {
            if (start != null && end != null) {
                records = weatherReadingRepository.findByStationIdAndStatusAndTimestampBetweenOrderByTimestampAsc(
                        stationId, normalStatus, start, end);
            } else {
                records = weatherReadingRepository.findByStationIdAndStatusOrderByTimestampAsc(stationId, normalStatus);
            }
        } else {
            if (start != null && end != null) {
                records = weatherReadingRepository.findByStatusAndTimestampBetweenOrderByTimestampAsc(
                        normalStatus, start, end);
            } else {
                records = weatherReadingRepository.findByStatusOrderByTimestampAsc(normalStatus);
            }
        }

        if (records == null || records.isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND,
                    "No normal historical observations found for the selected period."
            );
        }

        boolean isPsv = "psv".equalsIgnoreCase(format);
        String sep = isPsv ? "|" : ",";
        DateTimeFormatter dtFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        StringBuilder sb = new StringBuilder();
        sb.append(String.join(sep,
                "station_id",
                "timestamp",
                "temperature",
                "relative_humidity",
                "pressure",
                "wind_speed",
                "visibility",
                "status",
                "data_source"
        )).append("\n");

        for (WeatherReading r : records) {
            String tsStr = r.getTimestamp() != null ? r.getTimestamp().format(dtFormatter) : "";
            String tempStr = r.getTemperature() != null ? String.valueOf(r.getTemperature()) : "";
            String humStr = r.getRelativeHumidity() != null ? String.valueOf(r.getRelativeHumidity()) : "";
            String pressStr = r.getStationLevelPressure() != null ? String.valueOf(r.getStationLevelPressure()) : "";
            String windStr = r.getWindSpeed() != null ? String.valueOf(r.getWindSpeed()) : "";
            String visStr = r.getVisibility() != null ? String.valueOf(r.getVisibility()) : "";
            String statusStr = r.getStatus() != null ? r.getStatus() : "NORMAL";
            String dsStr = r.getDataSource() != null ? r.getDataSource() : "LIVE";

            sb.append(r.getStationId() != null ? r.getStationId() : "").append(sep)
              .append(tsStr).append(sep)
              .append(tempStr).append(sep)
              .append(humStr).append(sep)
              .append(pressStr).append(sep)
              .append(windStr).append(sep)
              .append(visStr).append(sep)
              .append(statusStr).append(sep)
              .append(dsStr).append("\n");
        }

        return sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }
}
