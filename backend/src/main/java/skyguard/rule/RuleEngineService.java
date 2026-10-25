package skyguard.rule;

import org.springframework.stereotype.Service;
import skyguard.dto.WeatherRequest;
import skyguard.entity.Station;
import skyguard.entity.WeatherReading;

import java.util.List;

@Service
public class RuleEngineService {

    /**
     * Evaluates quality-control rules for a new weather reading against station metadata and recent history.
     */
    public RuleResult evaluate(WeatherRequest request, Station station, List<WeatherReading> history) {
        RuleResult result = new RuleResult();

        Double temp = request.getTemperature();
        Double press = request.getStationLevelPressure() > 0 ? request.getStationLevelPressure() : request.getSeaLevelPressure();
        Double hum = request.getRelativeHumidity();

        // 1. Missing Values Check
        if (temp == null || temp == 0.0 && request.getTemperature() == 0.0 && isMissingField(request, "temperature")) {
            result.addFlag("MISSING_SENSOR", "Temperature sensor value is missing", true);
        }
        if (press == null || press <= 0.0) {
            result.addFlag("MISSING_SENSOR", "Pressure sensor value is missing", true);
        }
        if (hum == null || hum < 0.0) {
            result.addFlag("MISSING_SENSOR", "Humidity sensor value is missing", true);
        }

        // 2. Range Validation (Station & Elevation Aware)
        if (temp != null) {
            if (temp < -50.0 || temp > 60.0) {
                result.addFlag("RANGE_VIOLATION", "Temperature (" + temp + "°C) is outside physical operational limits (-50°C to 60°C)", true);
            }
        }

        if (hum != null) {
            if (hum < 0.0 || hum > 100.0) {
                result.addFlag("RANGE_VIOLATION", "Relative humidity (" + hum + "%) is outside valid 0–100% range", true);
            }
        }

        if (press != null && press > 0.0) {
            double minPressure = 850.0;
            double maxPressure = 1100.0;

            // Elevation awareness: High altitude station Coonoor (~1850m) standard pressure is ~700–950 hPa
            if (station != null && station.getElevation() != null && station.getElevation() >= 1000) {
                minPressure = 700.0;
                maxPressure = 950.0;
            }

            if (press < minPressure || press > maxPressure) {
                result.addFlag("RANGE_VIOLATION", "Atmospheric pressure (" + press + " hPa) is outside operational limits for station elevation (" + (station != null ? station.getElevation() : 0) + "m)", true);
            }
        }

        // If no history, return basic range/missing checks
        if (history == null || history.isEmpty()) {
            return result;
        }

        WeatherReading lastReading = history.get(0);

        // 3. Sudden Change Check (Rate of Change vs Recent Reading)
        if (temp != null && lastReading.getTemperature() != null) {
            double tempDiff = Math.abs(temp - lastReading.getTemperature());
            if (tempDiff > 8.0) {
                result.addFlag("SUDDEN_CHANGE", "Temperature changed sharply (" + String.format("%.1f", tempDiff) + "°C diff) compared with recent readings", false);
            }
        }

        if (press != null && press > 0 && lastReading.getStationLevelPressure() != null) {
            double pressDiff = Math.abs(press - lastReading.getStationLevelPressure());
            if (pressDiff > 6.0) {
                result.addFlag("SUDDEN_CHANGE", "Pressure changed sharply (" + String.format("%.1f", pressDiff) + " hPa diff) compared with recent readings", false);
            }
        }

        if (hum != null && lastReading.getRelativeHumidity() != null) {
            double humDiff = Math.abs(hum - lastReading.getRelativeHumidity());
            if (humDiff > 35.0) {
                result.addFlag("SUDDEN_CHANGE", "Humidity changed sharply (" + String.format("%.1f", humDiff) + "% diff) compared with recent readings", false);
            }
        }

        // 4. Frozen Sensor Detection (Repeated identical values over consecutive observations)
        if (history.size() >= 10 && temp != null && press != null && hum != null) {
            boolean tempFrozen = true;
            boolean pressFrozen = true;
            boolean humFrozen = true;

            int checkLimit = Math.min(history.size(), 10);
            for (int i = 0; i < checkLimit; i++) {
                WeatherReading r = history.get(i);
                if (r.getTemperature() == null || Math.abs(r.getTemperature() - temp) > 0.001) tempFrozen = false;
                if (r.getStationLevelPressure() == null || Math.abs(r.getStationLevelPressure() - press) > 0.001) pressFrozen = false;
                if (r.getRelativeHumidity() == null || Math.abs(r.getRelativeHumidity() - hum) > 0.001) humFrozen = false;
            }

            if (tempFrozen && pressFrozen && humFrozen) {
                result.addFlag("FROZEN_SENSOR", "All primary sensors reporting identical readings across 10+ consecutive observations", false);
            }
        }

        return result;
    }

    private boolean isMissingField(WeatherRequest request, String field) {
        return false;
    }
}
