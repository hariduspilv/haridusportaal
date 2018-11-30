package ee.htm.portal.services;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nortal.jroad.client.service.configuration.provider.PropertiesBasedXRoadServiceConfigurationProvider;
import com.nortal.jroad.client.service.configuration.provider.XRoadServiceConfigurationProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@SpringBootApplication
@ComponentScan({"ee.htm.portal.services", "com.nortal.jroad.client"})
public class HTMServicesApplication {

  public static void main(String[] args) {
    SpringApplication.run(HTMServicesApplication.class, args);
  }

  @Bean("XRoadServiceConfigurationProvider")
  public XRoadServiceConfigurationProvider xRoadServiceConfigurationProvider() {
    return new PropertiesBasedXRoadServiceConfigurationProvider();
  }

  @Value("${spring.redis.host}")
  private String redisHost;

  @Value("${spring.redis.port}")
  private Integer redisPort;

  @Bean
  public LettuceConnectionFactory redisConnectionFactory() {
    return new LettuceConnectionFactory(new RedisStandaloneConfiguration(redisHost, redisPort));
  }

  @Bean(name = "redisTemplate")
  RedisTemplate<String, Object> redisTemplate() {
    RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();
    redisTemplate.setConnectionFactory(redisConnectionFactory());
    redisTemplate.setKeySerializer(new StringRedisSerializer());
    redisTemplate.setValueSerializer(new StringRedisSerializer());
    redisTemplate.setHashKeySerializer(new StringRedisSerializer());
    redisTemplate.setHashValueSerializer(new Jackson2JsonRedisSerializer(ObjectNode.class));
    return redisTemplate;
  }
}
