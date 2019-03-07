package ee.htm.portal.services.client;

import com.nortal.jroad.client.exception.XRoadServiceConsumptionException;
import com.nortal.jroad.model.XRoadMessage;
import com.nortal.jroad.model.XmlBeansXRoadMessage;
import ee.htm.portal.services.database.EisXRoadDatabaseImpl;
import ee.htm.portal.services.types.eu.x_road.eis.v4.ETunnistusKehtivusDocument.ETunnistusKehtivus;
import ee.htm.portal.services.types.eu.x_road.eis.v4.ETunnistusKehtivusParing;
import ee.htm.portal.services.types.eu.x_road.eis.v4.ETunnistusKehtivusResponseDocument.ETunnistusKehtivusResponse;
import ee.htm.portal.services.types.eu.x_road.eis.v4.ETunnistusKodDocument.ETunnistusKod;
import ee.htm.portal.services.types.eu.x_road.eis.v4.ETunnistusKodParing;
import ee.htm.portal.services.types.eu.x_road.eis.v4.ETunnistusKodResponseDocument.ETunnistusKodResponse;
import ee.htm.portal.services.types.eu.x_road.eis.v4.TestidKodDocument.TestidKod;
import ee.htm.portal.services.types.eu.x_road.eis.v4.TestidKodParing;
import ee.htm.portal.services.types.eu.x_road.eis.v4.TestidKodVastus;
import ee.htm.portal.services.types.eu.x_road.eis.v4.TestsessioonidKodDocument.TestsessioonidKod;
import ee.htm.portal.services.types.eu.x_road.eis.v4.TestsessioonidKodVastus;
import java.math.BigInteger;
import org.springframework.stereotype.Service;

@Service("eisXRoadService")
public class EisXRoadServiceImpl extends EisXRoadDatabaseImpl implements EisXRoadService {

  public TestsessioonidKodVastus testsessioonidKod(String userId)
      throws XRoadServiceConsumptionException {
    if (userId == null || userId.equalsIgnoreCase("-")) {
      return testsessioonidKodV1(TestsessioonidKod.Factory.newInstance()).getResponse();
    }

    return testsessioonidKodV1(TestsessioonidKod.Factory.newInstance(), userId).getResponse();
  }

  public TestidKodVastus testidKod(BigInteger testSessioonId, String userId)
      throws XRoadServiceConsumptionException {
    TestidKod request = TestidKod.Factory.newInstance();
    TestidKodParing paring = TestidKodParing.Factory.newInstance();
    paring.setTestsessioonId(testSessioonId);
    request.setRequest(paring);

    if (userId == null || userId.equalsIgnoreCase("-")) {
      return testidKodV1(request).getResponse();
    }

    return testidKodV1(request, userId).getResponse();
  }

  public XRoadMessage<ETunnistusKodResponse> eTunnistusKod(BigInteger tunnistusId, String userId)
      throws XRoadServiceConsumptionException {
    ETunnistusKod request = ETunnistusKod.Factory.newInstance();
    ETunnistusKodParing paring = ETunnistusKodParing.Factory.newInstance();
    paring.setTunnistusId(tunnistusId);
    request.setRequest(paring);

    if (userId == null || userId.equalsIgnoreCase("-")) {
      return send(new XmlBeansXRoadMessage<ETunnistusKod>(request), "e_tunnistus_kod", "v1");
    }

    return send(new XmlBeansXRoadMessage<ETunnistusKod>(request), "e_tunnistus_kod", "v1", userId);
  }

  public XRoadMessage<ETunnistusKehtivusResponse> eTunnistusKehtivus(String personalcode,
      String tunnistusNr,
      String userId) throws XRoadServiceConsumptionException {
    ETunnistusKehtivus request = ETunnistusKehtivus.Factory.newInstance();
    ETunnistusKehtivusParing paring = ETunnistusKehtivusParing.Factory.newInstance();
    paring.setTunnistusNr(tunnistusNr);
    paring.setIsikukood(personalcode);
    request.setRequest(paring);

    if (userId == null || userId.equalsIgnoreCase("-")) {
      return send(new XmlBeansXRoadMessage<ETunnistusKehtivus>(request), "e_tunnistus_kehtivus",
          "v1");
    }

    return send(new XmlBeansXRoadMessage<ETunnistusKehtivus>(request), "e_tunnistus_kehtivus", "v1",
        userId);
  }
}
