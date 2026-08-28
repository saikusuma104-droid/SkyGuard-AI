package skyguard.service;

import org.springframework.stereotype.Service;

import skyguard.client.MLServiceClient;
import skyguard.dto.AnomalyResponse;
import skyguard.dto.WeatherRequest;

@Service
public class AnomalyService {

    private final MLServiceClient mlServiceClient;


    public AnomalyService(
            MLServiceClient mlServiceClient) {

        this.mlServiceClient = mlServiceClient;
    }


    public Object getLiveAWSData() {
        return mlServiceClient.getLiveAWSData();
    }

    public AnomalyResponse checkAnomaly(
            WeatherRequest request) {

        return mlServiceClient.predict(request);
    }
}
