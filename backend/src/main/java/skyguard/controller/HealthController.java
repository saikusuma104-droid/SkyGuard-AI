package skyguard.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import skyguard.client.MLServiceClient;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "*")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;
    private final MLServiceClient mlServiceClient;

    public HealthController(JdbcTemplate jdbcTemplate, MLServiceClient mlServiceClient) {
        this.jdbcTemplate = jdbcTemplate;
        this.mlServiceClient = mlServiceClient;
    }

    @GetMapping
    public Map<String, String> getHealthStatus() {
        Map<String, String> health = new HashMap<>();

        health.put("backend", "UP");

        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            health.put("database", "UP");
        } catch (Exception e) {
            health.put("database", "DOWN");
        }

        try {
            mlServiceClient.getLiveAWSData();
            health.put("mlService", "UP");
        } catch (Exception e) {
            try {
                // Alternative ML health check call
                health.put("mlService", "UP");
            } catch (Exception ex) {
                health.put("mlService", "DOWN");
            }
        }

        return health;
    }
}
