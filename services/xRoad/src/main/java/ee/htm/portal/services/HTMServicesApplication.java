package ee.htm.portal.services;

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

//  @Bean
//  JedisConnectionFactory redisConnectionFactory() {
//    JedisConnectionFactory factory = new JedisConnectionFactory();
//    factory.setHostName(redisHost);
//    factory.setPort(redisPort);
//    factory.setUsePool(true);
//    return factory;
//  }

  @Bean
  public LettuceConnectionFactory redisConnectionFactory() {
    return new LettuceConnectionFactory(new RedisStandaloneConfiguration(redisHost, redisPort));
  }

  @Bean(name = "redisTemplate")
  RedisTemplate<String, Object> redisTemplate() {
    RedisTemplate<String, Object> redisTemplate = new RedisTemplate<String, Object>();
    redisTemplate.setConnectionFactory(redisConnectionFactory());
    return redisTemplate;
  }
}
