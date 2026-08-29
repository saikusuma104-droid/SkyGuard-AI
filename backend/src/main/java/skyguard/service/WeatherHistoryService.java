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
}
