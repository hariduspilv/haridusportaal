package ee.htm.portal.services.workers;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import ee.htm.portal.services.client.AriregXRoadService;
import ee.htm.portal.services.types.eu.x_road.arireg.producer.EsindusV1Response;
import java.sql.Timestamp;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;

public class AriregWorker extends Worker {

  private static final Logger log = LoggerFactory.getLogger(AriregWorker.class);

  private AriregXRoadService ariregXRoadService;

  public AriregWorker(AriregXRoadService ariregXRoadService,
      RedisTemplate<String, Object> redisTemplate, Long redisExpire, Long redisFileExpire,
      Long redisKlfExpire) {
    super(redisTemplate, redisExpire, redisFileExpire, redisKlfExpire);
    this.ariregXRoadService = ariregXRoadService;
  }

  public ObjectNode getEsindusOigus(String personalCode, String countryCode, Long timestamp) {
    ObjectNode responseNode = nodeFactory.objectNode();

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
    logForDrupal.setType("ARIREG - esindus_v1.v1");
    logForDrupal.setSeverity("notice");

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

      logForDrupal.setMessage("ARIREG - esindus.v1 teenuselt andmete pärimine õnnestus.");
    } catch (Exception e) {
      setError(log, responseNode, e);
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    log.info(logForDrupal.toString());
    responseNode.put("response_timestamp", System.currentTimeMillis());

    redisTemplate.opsForHash().put(personalCode, "esindusOigus", responseNode);
    redisTemplate.expire(personalCode, redisExpire, TimeUnit.MINUTES);

    return responseNode;
  }
}
