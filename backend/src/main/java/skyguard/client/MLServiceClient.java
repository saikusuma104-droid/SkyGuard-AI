package skyguard.client;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import skyguard.dto.AnomalyResponse;
import skyguard.dto.WeatherRequest;

import java.util.HashMap;
import java.util.Map;

@Service
public class MLServiceClient {

    private final RestTemplate restTemplate = new RestTemplate();

    private final String ML_URL = "http://localhost:8000/predict";

    private final String ML_LIVE_URL = "http://localhost:8000/live-aws";

    public Object getLiveAWSData() {
        try {
            return restTemplate.getForObject(ML_LIVE_URL, Object.class);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "ML live service unavailable", e);
        }
    }

    public AnomalyResponse predict(WeatherRequest request) {
        Map<String, Object> data = new HashMap<>();

        data.put("station_id", request.getStationId());
        data.put("timestamp", request.getTimestamp());
        data.put("temperature", request.getTemperature());
        data.put("dew_point_temperature", request.getDewPointTemperature());
        data.put("station_level_pressure", request.getStationLevelPressure());
        data.put("sea_level_pressure", request.getSeaLevelPressure());
        data.put("wind_direction", request.getWindDirection());
        data.put("wind_speed", request.getWindSpeed());
        data.put("relative_humidity", request.getRelativeHumidity());
        data.put("visibility", request.getVisibility());

        try {
            AnomalyResponse response = restTemplate.postForObject(
                    ML_URL,
                    data,
                    AnomalyResponse.class
            );
            if (response == null) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "ML detection service returned empty response");
            }
            return response;
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "ML detection service unavailable: " + e.getMessage(), e);
        }
    }
}
