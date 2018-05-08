package ee.htm.portal.services;

import com.nortal.jroad.client.exception.XRoadServiceConsumptionException;
import com.nortal.jroad.client.test.BaseXRoadServiceImplTest;
import ee.htm.portal.services.client.EhisV6XRoadServiceImpl;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.EeIsikukaartResponseDocument.EeIsikukaartResponse;
import javax.annotation.Resource;
import org.junit.Assert;
import org.junit.Test;
import org.springframework.test.context.ContextConfiguration;

@ContextConfiguration(locations = {"classpath:client-ehis-test.xml"})
public class EhisV6XRoadServiceImplTest extends BaseXRoadServiceImplTest {

  String noDataString = "Isiku kohta andmeid ei leitud.";
  String birthDate = "1979-10-07+03:00";

  @Resource
  private EhisV6XRoadServiceImpl ehisV6XRoadService;

  @Test()
  public void personNotFound() throws XRoadServiceConsumptionException {
    try {
      EeIsikukaartResponse response = ehisV6XRoadService
          .eeIsikukaart("38304119955", "xml", "38304119955");
    } catch (XRoadServiceConsumptionException e) {
      Assert.assertEquals(noDataString, e.getFaultString());
    }
  }

  @Test()
  public void checkBirthDate() throws XRoadServiceConsumptionException {
    EeIsikukaartResponse response = ehisV6XRoadService
        .eeIsikukaart("37207318816", "xml", "37207318816");
    Assert
        .assertEquals(birthDate, response.getIsikukaart().getIsikuandmed().getSynniKp().toString());
  }
}
