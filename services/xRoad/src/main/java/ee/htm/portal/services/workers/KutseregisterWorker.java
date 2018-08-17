package ee.htm.portal.services.workers;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import ee.htm.portal.services.client.KutseregisterV6XRoadService;
import ee.htm.portal.services.types.ee.riik.xtee.kutseregister.producers.producer.kutseregister.KodanikKutsetunnistusVastusDocument.KodanikKutsetunnistusVastus;
import java.sql.Timestamp;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class KutseregisterWorker extends Worker {

  private static final Logger LOGGER = Logger.getLogger(KutseregisterWorker.class);

  @Autowired
  private KutseregisterV6XRoadService kutseregisterV6XRoadService;

  private final String KUTSEREGISTER_REDIS_KEY = "KUTSEREGISTER";

  public ObjectNode work(String personalCode, boolean invalidBoolean, Long timestamp) {
    ObjectNode responseNode = nodeFactory.objectNode();
    logForDrupal.setUser(personalCode);
    logForDrupal.setType("Kutseregister - kodanikKutsetunnistus.V2");

    responseNode.put("request_timestamp", timestamp)
        .put("response_timestamp", "")
        .put("key", "kutsetunnistused_" + personalCode);
    ObjectNode value = responseNode.putObject("value");

    try {
      KodanikKutsetunnistusVastus response = kutseregisterV6XRoadService
          .kodanikKutsetunnistus(invalidBoolean, personalCode);

      value.put("kirjeid", response.isSetKirjeid() ? response.getKirjeid().intValue() : 0)
          .put("teade", response.isSetTeade() ? response.getTeade() : null);
      ArrayNode kutsetunnistused = value.putArray("kutsetunnistused");

      if (response.isSetKutsetunnistused()) {
        response.getKutsetunnistused().getKutsetunnistusList().forEach(kutsetunnistusV2Type -> {
          kutsetunnistused.addObject()
              .put("registrinumber", kutsetunnistusV2Type.getRegistrinumber())
              .put("nimi", kutsetunnistusV2Type.getNimi())
              .put("isikukood", kutsetunnistusV2Type.getIsikukood())
              .put("synniaeg",
                  simpleDateFormat.format(kutsetunnistusV2Type.getSynniaeg().getTimeInMillis()))
              .put("tyyp", kutsetunnistusV2Type.getTyyp())
              .put("standard", kutsetunnistusV2Type.getStandard())
              .put("ekrtase", kutsetunnistusV2Type.getEkrtase())
              .put("eqftase", kutsetunnistusV2Type.getEqftase())
              .put("spetsialiseerumine", kutsetunnistusV2Type.getSpetsialiseerumine())
              .put("osakutse", kutsetunnistusV2Type.getOsakutse())
              .put("lisavali", kutsetunnistusV2Type.getLisavali())
              .put("kompetentsid", kutsetunnistusV2Type.getKompetentsid())
              .put("valdkond", kutsetunnistusV2Type.getValdkond())
              .put("kutseala", kutsetunnistusV2Type.getKutseala())
              .put("hariduslikkval", kutsetunnistusV2Type.getHariduslikkval())
              .put("keel", kutsetunnistusV2Type.getKeel())
              .put("valjastaja", kutsetunnistusV2Type.getValjastaja())
              .put("valjaantud",
                  simpleDateFormat.format(kutsetunnistusV2Type.getValjaantud().getTimeInMillis()))
              .put("kehtibalates",
                  simpleDateFormat.format(kutsetunnistusV2Type.getKehtibalates().getTimeInMillis()))
              .put("kehtibkuni",
                  simpleDateFormat.format(kutsetunnistusV2Type.getKehtibkuni().getTimeInMillis()))
              .put("isco", kutsetunnistusV2Type.getIsco())
              .put("reaid", kutsetunnistusV2Type.getReaid())
              .put("duplikaat", kutsetunnistusV2Type.getDuplikaat())
              .put("kehtetu", kutsetunnistusV2Type.getKehtetu())
              .put("kustutatud", kutsetunnistusV2Type.getKustutatud());
        });
      }

      logForDrupal.setMessage(
          "Kutseregister - kodanikKutsetunnistus.V2 teenuselt andmete pärimine õnnestus.");
    } catch (Exception e) {
      LOGGER.error(e, e);
      logForDrupal.setSeverity("ERROR");
      logForDrupal.setMessage(e.getMessage());

      redisTemplate.opsForHash()
          .put(KUTSEREGISTER_REDIS_KEY, "kutsetunnistused_" + personalCode, "Tehniline viga!");

      responseNode.putObject("error")
          .put("message_type", "ERROR").putObject("message_text").put("et", "Tehniline viga!");
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    sender.send(logsTopic, null, logForDrupal, "KODANIKKUTSETUNNISTUS");

    responseNode.put("response_timestamp", System.currentTimeMillis());

    redisTemplate.opsForHash()
        .put(KUTSEREGISTER_REDIS_KEY, "kutsetunnistused_" + personalCode, responseNode.toString());

    return responseNode;
  }
}
