package ee.htm.portal.services;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class JRoadApplication implements CommandLineRunner {

  public static void main(String[] args) {
    SpringApplication.run(JRoadApplication.class, args);
  }

  @Override
  public void run(String[] args) {
    System.out.println("Tere Maailm!");
  }
}
