package ee.htm.portal.services.client;

import com.nortal.jroad.client.exception.XRoadServiceConsumptionException;
import com.nortal.jroad.client.service.XRoadDatabaseService;
import ee.htm.portal.services.database.KutseregisterXRoadDatabase;
import ee.htm.portal.services.types.ee.riik.xtee.kutseregister.producers.producer.kutseregister.KodanikKutsetunnistusParingDocument.KodanikKutsetunnistusParing;
import ee.htm.portal.services.types.ee.riik.xtee.kutseregister.producers.producer.kutseregister.KodanikKutsetunnistusVastusDocument.KodanikKutsetunnistusVastus;
import javax.annotation.Resource;
import org.springframework.stereotype.Service;

@Service("kutseregisterXTeeService")
public class KutseregisterV6XRoadServiceImpl extends XRoadDatabaseService implements KutseregisterV6XRoadService {

  @Resource
  private KutseregisterXRoadDatabase kutseregisterXRoadDatabase;

  public KodanikKutsetunnistusVastus kodanikKutsetunnistus(boolean invalidBoolean, String userId) throws XRoadServiceConsumptionException {
    KodanikKutsetunnistusParing request = KodanikKutsetunnistusParing.Factory.newInstance();
    request.setKehtetud(invalidBoolean);

    return kutseregisterXRoadDatabase.kodanikKutsetunnistusV2(request, userId);
  }
}
