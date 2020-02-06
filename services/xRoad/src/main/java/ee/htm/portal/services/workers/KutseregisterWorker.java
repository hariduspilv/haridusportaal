package ee.htm.portal.services.workers;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import ee.htm.portal.services.client.KutseregisterXRoadService;
import ee.htm.portal.services.types.ee.riik.xtee.kutseregister.producers.producer.kutseregister.KodanikKutsetunnistusVastusDocument.KodanikKutsetunnistusVastus;
import java.sql.Timestamp;
import java.util.concurrent.TimeUnit;
import org.apache.log4j.Logger;
import org.springframework.data.redis.core.RedisTemplate;

public class KutseregisterWorker extends Worker {

  private static final Logger LOGGER = Logger.getLogger(KutseregisterWorker.class);

  private KutseregisterXRoadService kutseregisterXRoadService;

  public KutseregisterWorker(KutseregisterXRoadService kutseregisterXRoadService,
      RedisTemplate<String, Object> redisTemplate, Long redisExpire, Long redisFileExpire,
      Long redisKlfExpire) {
    super(redisTemplate, redisExpire, redisFileExpire, redisKlfExpire);
    this.kutseregisterXRoadService = kutseregisterXRoadService;
  }

  public ObjectNode getKodanikKutsetunnistus(String personalCode, boolean invalidBoolean,
      Long timestamp) {
    ObjectNode responseNode = nodeFactory.objectNode();

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
    logForDrupal.setType("Kutseregister - kodanikKutsetunnistus.V2");
    logForDrupal.setSeverity("notice");

    responseNode.put("request_timestamp", timestamp)
        .put("response_timestamp", "")
        .put("key", "kodanikKutsetunnistus");

    try {
      KodanikKutsetunnistusVastus response = kutseregisterXRoadService
          .kodanikKutsetunnistus(invalidBoolean, personalCode);

      ObjectNode value = responseNode.putObject("value");
      value.put("kirjeid", response.isSetKirjeid() ? response.getKirjeid().intValue() : 0)
          .put("teade", response.isSetTeade() ? response.getTeade() : null);
      ArrayNode kutsetunnistused = value.putArray("kutsetunnistused");

      if (response.isSetKutsetunnistused()) {
        response.getKutsetunnistused().getKutsetunnistusList()
            .forEach(kutsetunnistusV2Type -> kutsetunnistused.addObject()
                .put("registrinumber",
                    kutsetunnistusV2Type.isSetRegistrinumber() ? kutsetunnistusV2Type
                        .getRegistrinumber() : null)
                .put("nimi",
                    kutsetunnistusV2Type.isSetNimi() ? kutsetunnistusV2Type.getNimi() : null)
                .put("isikukood",
                    kutsetunnistusV2Type.isSetIsikukood() ? kutsetunnistusV2Type.getIsikukood()
                        : null)
                .put("synniaeg", kutsetunnistusV2Type.isSetSynniaeg() ? simpleDateFormat
                    .format(kutsetunnistusV2Type.getSynniaeg().getTimeInMillis()) : null)
                .put("tyyp",
                    kutsetunnistusV2Type.isSetTyyp() ? kutsetunnistusV2Type.getTyyp() : null)
                .put("standard",
                    kutsetunnistusV2Type.isSetStandard() ? kutsetunnistusV2Type.getStandard()
                        : null)
                .put("ekrtase",
                    kutsetunnistusV2Type.isSetEkrtase() ? kutsetunnistusV2Type.getEkrtase()
                        .intValue()
                        : null)
                .put("eqftase",
                    kutsetunnistusV2Type.isSetEqftase() ? kutsetunnistusV2Type.getEqftase()
                        .intValue()
                        : null)
                .put("spetsialiseerumine",
                    kutsetunnistusV2Type.isSetSpetsialiseerumine() ? kutsetunnistusV2Type
                        .getSpetsialiseerumine() : null)
                .put("osakutse",
                    kutsetunnistusV2Type.isSetOsakutse() ? kutsetunnistusV2Type.getOsakutse()
                        : null)
                .put("lisavali",
                    kutsetunnistusV2Type.isSetLisavali() ? kutsetunnistusV2Type.getLisavali()
                        : null)
                .put("kompetentsid",
                    kutsetunnistusV2Type.isSetKompetentsid() ? kutsetunnistusV2Type
                        .getKompetentsid()
                        : null)
                .put("valdkond",
                    kutsetunnistusV2Type.isSetValdkond() ? kutsetunnistusV2Type.getValdkond()
                        : null)
                .put("kutseala",
                    kutsetunnistusV2Type.isSetKutseala() ? kutsetunnistusV2Type.getKutseala()
                        : null)
                .put("hariduslikkval",
                    kutsetunnistusV2Type.isSetHariduslikkval() ? kutsetunnistusV2Type
                        .getHariduslikkval() : null)
                .put("keel",
                    kutsetunnistusV2Type.isSetKeel() ? kutsetunnistusV2Type.getKeel() : null)
                .put("valjastaja",
                    kutsetunnistusV2Type.isSetValjastaja() ? kutsetunnistusV2Type.getValjastaja()
                        : null)
                .put("valjaantud", kutsetunnistusV2Type.isSetValjaantud() ? simpleDateFormat
                    .format(kutsetunnistusV2Type.getValjaantud().getTimeInMillis()) : null)
                .put("kehtibalates", kutsetunnistusV2Type.isSetKehtibalates() ? simpleDateFormat
                    .format(kutsetunnistusV2Type.getKehtibalates().getTimeInMillis()) : null)
                .put("kehtibkuni", kutsetunnistusV2Type.isSetKehtibkuni() ? simpleDateFormat
                    .format(kutsetunnistusV2Type.getKehtibkuni().getTimeInMillis()) : null)
                .put("isco",
                    kutsetunnistusV2Type.isSetIsco() ? kutsetunnistusV2Type.getIsco() : null)
                .put("reaid",
                    kutsetunnistusV2Type.isSetReaid() ? kutsetunnistusV2Type.getReaid() : null)
                .put("duplikaat",
                    kutsetunnistusV2Type.isSetDuplikaat() ? kutsetunnistusV2Type.getDuplikaat()
                        : null)
                .put("kehtetu",
                    kutsetunnistusV2Type.isSetKehtetu() ? kutsetunnistusV2Type.getKehtetu() : null)
                .put("kustutatud",
                    kutsetunnistusV2Type.isSetKustutatud() ? kutsetunnistusV2Type.getKustutatud()
                        : null));
      }

      logForDrupal.setMessage(
          "Kutseregister - kodanikKutsetunnistus.V2 teenuselt andmete pärimine õnnestus.");
    } catch (Exception e) {
      setError(LOGGER, responseNode, e);
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    LOGGER.info(logForDrupal);

    responseNode.put("response_timestamp", System.currentTimeMillis());

    redisTemplate.opsForHash().put(personalCode, "kodanikKutsetunnistus", responseNode);
    redisTemplate.expire(personalCode, redisExpire, TimeUnit.MINUTES);

    return responseNode;
  }
}
