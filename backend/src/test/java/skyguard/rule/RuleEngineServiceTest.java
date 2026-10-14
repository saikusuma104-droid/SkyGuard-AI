package skyguard.rule;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import skyguard.dto.WeatherRequest;
import skyguard.entity.Station;
import skyguard.entity.WeatherReading;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class RuleEngineServiceTest {

    private RuleEngineService ruleEngineService;
    private Station tuniStation;
    private Station coonoorStation;

    @BeforeEach
    public void setUp() {
        ruleEngineService = new RuleEngineService();
        tuniStation = new Station("station_01", "Tuni", 17.3615, 82.5468, 24.0, true);
        coonoorStation = new Station("station_05", "Coonoor", 11.3459, 76.7965, 1746.0, true);
    }

    @Test
    public void testNormalReading() {
        WeatherRequest request = new WeatherRequest();
        request.setStationId("station_01");
        request.setTemperature(32.5);
        request.setStationLevelPressure(1008.2);
        request.setRelativeHumidity(65.0);

        RuleResult result = ruleEngineService.evaluate(request, tuniStation, new ArrayList<>());

        assertFalse(result.hasViolations());
        assertFalse(result.isCritical());
        assertFalse(result.isWarning());
    }

    @Test
    public void testMissingPressure() {
        WeatherRequest request = new WeatherRequest();
        request.setStationId("station_01");
        request.setTemperature(32.0);
        request.setStationLevelPressure(0.0);
        request.setRelativeHumidity(65.0);

        RuleResult result = ruleEngineService.evaluate(request, tuniStation, new ArrayList<>());

        assertTrue(result.hasViolations());
        assertTrue(result.getFlags().contains("MISSING_SENSOR"));
    }

    @Test
    public void testInvalidHumidity() {
        WeatherRequest request = new WeatherRequest();
        request.setStationId("station_01");
        request.setTemperature(30.0);
        request.setStationLevelPressure(1005.0);
        request.setRelativeHumidity(150.0);

        RuleResult result = ruleEngineService.evaluate(request, tuniStation, new ArrayList<>());

        assertTrue(result.hasViolations());
        assertTrue(result.getFlags().contains("RANGE_VIOLATION"));
    }

    @Test
    public void testSuddenSpike() {
        WeatherRequest request = new WeatherRequest();
        request.setStationId("station_01");
        request.setTemperature(45.0); // Spike from 32.0
        request.setStationLevelPressure(1008.0);
        request.setRelativeHumidity(60.0);

        List<WeatherReading> history = new ArrayList<>();
        WeatherReading prev = new WeatherReading();
        prev.setTemperature(32.0);
        prev.setStationLevelPressure(1008.0);
        prev.setRelativeHumidity(60.0);
        history.add(prev);

        RuleResult result = ruleEngineService.evaluate(request, tuniStation, history);

        assertTrue(result.hasViolations());
        assertTrue(result.getFlags().contains("SUDDEN_CHANGE"));
    }

    @Test
    public void testFrozenSensor() {
        WeatherRequest request = new WeatherRequest();
        request.setStationId("station_01");
        request.setTemperature(32.0);
        request.setStationLevelPressure(1008.0);
        request.setRelativeHumidity(60.0);

        List<WeatherReading> history = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            WeatherReading prev = new WeatherReading();
            prev.setTemperature(32.0);
            prev.setStationLevelPressure(1008.0);
            prev.setRelativeHumidity(60.0);
            history.add(prev);
        }

        RuleResult result = ruleEngineService.evaluate(request, tuniStation, history);

        assertTrue(result.hasViolations());
        assertTrue(result.getFlags().contains("FROZEN_SENSOR"));
    }

    @Test
    public void testCoonoorNormalHighElevationReading() {
        WeatherRequest request = new WeatherRequest();
        request.setStationId("station_05");
        request.setTemperature(18.5);
        request.setStationLevelPressure(815.0); // Coonoor pressure baseline ~815 hPa
        request.setRelativeHumidity(75.0);

        RuleResult result = ruleEngineService.evaluate(request, coonoorStation, new ArrayList<>());

        assertFalse(result.hasViolations(), "Coonoor pressure ~815 hPa should NOT be flagged as range violation for high elevation (1746m)");
    }
}
