package ee.htm.portal.services.client;


import com.nortal.jroad.client.exception.XRoadServiceConsumptionException;
import com.nortal.jroad.model.XRoadMessage;
import ee.htm.portal.services.types.eu.x_road.eis.v4.ETunnistusKehtivusResponseDocument.ETunnistusKehtivusResponse;
import ee.htm.portal.services.types.eu.x_road.eis.v4.ETunnistusKodResponseDocument.ETunnistusKodResponse;
import ee.htm.portal.services.types.eu.x_road.eis.v4.TestidKodVastus;
import ee.htm.portal.services.types.eu.x_road.eis.v4.TestsessioonidKodVastus;
import java.math.BigInteger;

/**
 * <code>eis</code> EIS database X-tee v6 service.
 *
 * parameter userId - if null gets its value from xroad.properties id-code
 */
public interface EisXRoadService {

  TestsessioonidKodVastus testsessioonidKod(String userId)
      throws XRoadServiceConsumptionException;

  TestidKodVastus testidKod(BigInteger testSessioonId, String userId)
      throws XRoadServiceConsumptionException;

  XRoadMessage<ETunnistusKodResponse> eTunnistusKod(BigInteger tunnistusId, String userId)
      throws XRoadServiceConsumptionException;

  XRoadMessage<ETunnistusKehtivusResponse> eTunnistusKehtivus(String personalcode,
      String tunnistusNr, String userId) throws XRoadServiceConsumptionException;
}
