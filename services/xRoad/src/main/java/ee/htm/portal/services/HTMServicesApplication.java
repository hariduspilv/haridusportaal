package ee.htm.portal.services;

import com.nortal.jroad.client.service.configuration.provider.PropertiesBasedXRoadServiceConfigurationProvider;
import com.nortal.jroad.client.service.configuration.provider.XRoadServiceConfigurationProvider;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan({"ee.htm.portal.services","com.nortal.jroad.client"})
public class HTMServicesApplication {

  public static void main(String[] args) {
    SpringApplication.run(HTMServicesApplication.class, args);
  }

  @Bean("XRoadServiceConfigurationProvider")
  public XRoadServiceConfigurationProvider xRoadServiceConfigurationProvider() {
    return new PropertiesBasedXRoadServiceConfigurationProvider();
  }
}
