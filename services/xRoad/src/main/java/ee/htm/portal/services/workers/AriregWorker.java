package ee.htm.portal.services.workers;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import ee.htm.portal.services.client.AriregXRoadService;
import ee.htm.portal.services.types.eu.x_road.arireg.producer.EsindusV1Response;
import java.sql.Timestamp;
import javax.annotation.Resource;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;

@Service
public class AriregWorker extends Worker {

  private static final Logger LOGGER = Logger.getLogger(AriregWorker.class);

  @Resource
  AriregXRoadService ariregXRoadService;

  public ObjectNode getEsindusOigus(String personalCode, String countryCode, Long timestamp) {
    ObjectNode responseNode = nodeFactory.objectNode();

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
    logForDrupal.setType("ARIREG - esindus_v1.v1");

    responseNode.put("request_timestamp", timestamp).put("response_timestamp", "")
        .put("key", "esindusOigus");

    try {
      EsindusV1Response response = ariregXRoadService
          .getEsindusV1(personalCode, countryCode, personalCode);

      responseNode.putObject("value").putArray("ettevotted");
      response.getKeha().getEttevotjad().getItemList().forEach(
          ettevote -> {
            ObjectNode ettevoteNode = ((ArrayNode) responseNode.get("value").get("ettevotted"))
                .addObject();
            ettevoteNode.put("ariregistri_kood", ettevote.getAriregistriKood())
                .put("arinimi", ettevote.getArinimi())
                .put("staatus", ettevote.getStaatus())
                .put("staatus_tekstina", ettevote.getStaatusTekstina());

            ArrayNode isikudArrayNode = ettevoteNode.putArray("isikud");
            ettevote.getIsikud().getItemList().forEach(isik -> {
              if (isik.isSetFyysiliseIsikuKood()
                  && isik.getFyysiliseIsikuKood().equalsIgnoreCase(personalCode)) {
                isikudArrayNode.addObject().put("isiku_liik", isik.getIsikuLiik())
                    .put("fyysilise_isiku_eesnimi",
                        isik.isSetFyysiliseIsikuEesnimi() ?
                            isik.getFyysiliseIsikuEesnimi() : null)
                    .put("fyysilise_isiku_perenimi",
                        isik.isSetFyysiliseIsikuPerenimi() ?
                            isik.getFyysiliseIsikuPerenimi() : null)
                    .put("fyysilise_isiku_kood",
                        isik.isSetFyysiliseIsikuKood() ?
                            isik.getFyysiliseIsikuKood() : null)
                    .put("isikukood_riik",
                        isik.isSetIsikukoodRiik() ?
                            isik.getIsikukoodRiik() : null)
                    .put("isikukoodi_riik_tekstina",
                        isik.isSetIsikukoodiRiikTekstina() ?
                            isik.getIsikukoodiRiikTekstina() : null)
                    .put("fyysilise_isiku_roll",
                        isik.isSetFyysiliseIsikuRoll() ?
                            isik.getFyysiliseIsikuRoll() : null)
                    .put("fyysilise_isiku_roll_tekstina",
                        isik.isSetFyysiliseIsikuRollTekstina() ?
                            isik.getFyysiliseIsikuRollTekstina() : null)
                    .put("ainuesindusoigus_olemas",
                        isik.isSetAinuesindusoigusOlemas() ?
                            isik.getAinuesindusoigusOlemas() : null);
              }
            });

            ArrayNode esindusEritingimusedArrayNode = ettevoteNode
                .putArray("esindusoiguse_eritingimused");
            if (ettevote.getEsindusoiguseEritingimused() != null && !ettevote
                .getEsindusoiguseEritingimused().getItemList().isEmpty()) {
              ettevote.getEsindusoiguseEritingimused().getItemList()
                  .forEach(item -> esindusEritingimusedArrayNode.add(item.getItem()));
            }

            ettevoteNode.put("oiguslik_vorm", ettevote.getOiguslikVorm())
                .put("oiguslik_vorm_tekstina", ettevote.getOiguslikVormTekstina());
          });

    } catch (Exception e) {
      LOGGER.error(e, e);

      logForDrupal.setSeverity("ERROR");
      logForDrupal.setMessage(e.getMessage());

      redisTemplate.opsForHash().put(personalCode, "esindusOigus", "Tehniline viga!");

      responseNode.putObject("error")
          .put("message_type", "ERROR").putObject("message_text").put("et", "Tehniline viga!");
      responseNode.remove("value");
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    sender.send(logsTopic, null, logForDrupal, "arireg.esindus_v1.v1");

    responseNode.put("response_timestamp", System.currentTimeMillis());

    redisTemplate.opsForHash().put(personalCode, "esindusOigus", responseNode);

    return responseNode;
  }
}
