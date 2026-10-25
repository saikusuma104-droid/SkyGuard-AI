package skyguard.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import skyguard.entity.WeatherReading;
import skyguard.service.WeatherHistoryService;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class WeatherHistoryController {

    private final WeatherHistoryService weatherHistoryService;

    public WeatherHistoryController(WeatherHistoryService weatherHistoryService) {
        this.weatherHistoryService = weatherHistoryService;
    }

    @GetMapping({"/api/history", "/api/weather/history"})
    public List<WeatherReading> getHistory(
            @RequestParam(value = "stationId", required = false) String stationId,
            @RequestParam(value = "station", required = false) String station,
            @RequestParam(value = "from", required = false) String from,
            @RequestParam(value = "to", required = false) String to,
            @RequestParam(value = "start", required = false) String start,
            @RequestParam(value = "end", required = false) String end) {

        String selectedStation = (stationId != null && !stationId.trim().isEmpty()) ? stationId : station;
        String fromDate = (from != null && !from.trim().isEmpty()) ? from : start;
        String toDate = (to != null && !to.trim().isEmpty()) ? to : end;

        return weatherHistoryService.getHistory(selectedStation, fromDate, toDate);
    }

    @GetMapping("/api/weather/history/all")
    public List<WeatherReading> getAllHistory(
            @RequestParam(value = "from", required = false) String from,
            @RequestParam(value = "to", required = false) String to) {
        return weatherHistoryService.getAllHistory(from, to);
    }

    @GetMapping({"/api/history/download/csv", "/api/history/download/psv", "/api/weather/download"})
    public ResponseEntity<byte[]> downloadHistory(
            @RequestParam(value = "station", required = false) String station,
            @RequestParam(value = "stationId", required = false) String stationId,
            @RequestParam(value = "from", required = false) String from,
            @RequestParam(value = "to", required = false) String to,
            @RequestParam(value = "start", required = false) String start,
            @RequestParam(value = "end", required = false) String end,
            @RequestParam(value = "format", required = false) String format,
            jakarta.servlet.http.HttpServletRequest request) {

        String requestUri = request.getRequestURI();
        String selectedFormat = format;
        if (requestUri.endsWith("/csv")) {
            selectedFormat = "csv";
        } else if (requestUri.endsWith("/psv")) {
            selectedFormat = "psv";
        } else if (selectedFormat == null || selectedFormat.isEmpty()) {
            selectedFormat = "csv";
        }

        String selectedStation = (stationId != null && !stationId.trim().isEmpty()) ? stationId : station;
        String fromDate = (from != null && !from.trim().isEmpty()) ? from : start;
        String toDate = (to != null && !to.trim().isEmpty()) ? to : end;

        byte[] fileBytes = weatherHistoryService.generateDownloadFile(selectedStation, fromDate, toDate, selectedFormat);

        boolean isPsv = "psv".equalsIgnoreCase(selectedFormat);
        String ext = isPsv ? "psv" : "csv";
        String contentType = isPsv ? "text/plain" : "text/csv";

        String fromTag = (fromDate != null && !fromDate.trim().isEmpty()) ? fromDate.trim() : "start";
        String toTag = (toDate != null && !toDate.trim().isEmpty()) ? toDate.trim() : "end";
        String stationTag = (selectedStation != null && !selectedStation.trim().isEmpty() && !"all".equalsIgnoreCase(selectedStation))
                ? selectedStation.trim() + "_"
                : "";

        String filename = String.format("skyguard_%s%s_to_%s.%s", stationTag, fromTag, toTag, ext);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .header(HttpHeaders.CONTENT_TYPE, contentType + "; charset=UTF-8")
                .body(fileBytes);
    }
}
