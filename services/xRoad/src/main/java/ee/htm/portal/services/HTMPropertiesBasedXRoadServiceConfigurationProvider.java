package ee.htm.portal.services;

import com.nortal.jroad.client.enums.XroadObjectType;
import com.nortal.jroad.client.service.configuration.SimpleXRoadServiceConfiguration;
import com.nortal.jroad.client.service.configuration.XRoadServiceConfiguration;
import com.nortal.jroad.client.service.configuration.provider.AbstractXRoadServiceConfigurationProvider;
import com.nortal.jroad.client.util.PropertiesUtil;
import com.nortal.jroad.enums.XRoadProtocolVersion;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import javax.annotation.PostConstruct;
import org.apache.commons.lang.StringUtils;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

public class HTMPropertiesBasedXRoadServiceConfigurationProvider extends
    AbstractXRoadServiceConfigurationProvider {

  public static final String XROAD_PROPERTIES = "xroad.properties";
  public static final String XROAD_CLIENT_FORMAT = "%s-client";
  public static final String XROAD_CLIENT_KEY = "client";
  public static final String XROAD_SECURITY_SERVER_FORMAT = "%s-security-server";
  public static final String XROAD_SECURITY_SERVER_KEY = "security-server";
  public static final String XROAD_ID_CODE_FORMAT = "%s-id-code";
  public static final String XROAD_ID_CODE_KEY = "id-code";
  public static final String XROAD_FILE_FORMAT = "%s-file";
  public static final String XROAD_FILE_KEY = "file";
  public static final String XROAD_PROTOCOL_VERSION_KEY = "protocol-version";

  private Resource resource;
  private Map<String, Properties> properties = new HashMap<String, Properties>();

  @PostConstruct
  public void init() {
    if (resource == null) {
      resource = new ClassPathResource(XROAD_PROPERTIES);
    }
    properties.put(XROAD_PROPERTIES, loadProperties(resource));
  }

  @Override
  protected XRoadServiceConfiguration fillConfuguration(
      SimpleXRoadServiceConfiguration configuration) {
    String db = configuration.getDatabase();

    configuration.setSecurityServer(
        getHeaderProperty(XROAD_SECURITY_SERVER_FORMAT, XROAD_SECURITY_SERVER_KEY, db));
    configuration.setIdCode(getHeaderProperty(XROAD_ID_CODE_FORMAT, XROAD_ID_CODE_KEY, db));
    configuration.setProtocolVersion(XRoadProtocolVersion.getValueByVersionCode(
        getHeaderProperty(XROAD_PROTOCOL_VERSION_FORMAT, XROAD_PROTOCOL_VERSION_KEY, db)));
    configuration.setFile(getHeaderProperty(XROAD_FILE_FORMAT, XROAD_FILE_KEY, db));

    fillClientProperties(configuration, db);
    fillServiceProperties(configuration, db);

    return configuration;
  }

  protected void fillClientProperties(SimpleXRoadServiceConfiguration configuration, String db) {
    configuration.setClientXRoadInstance(getClientProperty(XROAD_INSTANCE_FORMAT, db));
    configuration.setClientMemberClass(getClientProperty(XROAD_MEMBER_CLASS_FORMAT, db));
    configuration.setClientMemberCode(getClientProperty(XROAD_MEMBER_CODE_FORMAT, db));
    configuration.setClientSubsystemCode(getClientProperty(XROAD_SUBSYSTEM_CODE_FORMAT, db));
    String objectType = getClientProperty(XROAD_OBJECT_TYPE_FORMAT, db);
    if (StringUtils.isNotBlank(objectType)) {
      configuration.setClientObjectType(XroadObjectType.valueOf(objectType));
    }
  }

  protected void fillServiceProperties(SimpleXRoadServiceConfiguration configuration, String db) {
    configuration.setServiceXRoadInstance(getServiceProperty(XROAD_INSTANCE_FORMAT, db));
    configuration.setServiceMemberClass(getServiceProperty(XROAD_MEMBER_CLASS_FORMAT, db));
    configuration.setServiceMemberCode(getServiceProperty(XROAD_MEMBER_CODE_FORMAT, db));
    configuration.setServiceSubsystemCode(getServiceProperty(XROAD_SUBSYSTEM_CODE_FORMAT, db));
    String objectType = getServiceProperty(XROAD_OBJECT_TYPE_FORMAT, db);
    if (StringUtils.isNotBlank(objectType)) {
      configuration.setServiceObjectType(XroadObjectType.valueOf(objectType));
    }
  }

  protected String getClientProperty(String pattern, String db) {
    String result = getProperty(XROAD_PROPERTIES, getKey(pattern, getKey(XROAD_CLIENT_FORMAT, db)));
    if (StringUtils.isNotBlank(result)) {
      return result;
    }
    return getProperty(XROAD_PROPERTIES, getKey(pattern, XROAD_CLIENT_KEY));
  }

  protected String getServiceProperty(String pattern, String db) {
    return getProperty(getKey(XROAD_PROPERTIES, db), getKey(pattern, db));
  }

  protected String getHeaderProperty(String pattern, String defaultPattern, String db) {
    String result = getProperty(getKey(pattern, db));
    if (StringUtils.isNotBlank(result)) {
      return result;
    }
    return getProperty(defaultPattern);
  }

  protected String getProperty(String key) {
    return getProperty(XROAD_PROPERTIES, key);
  }

  protected String getProperty(String target, String key) {
    String result = properties.get(XROAD_PROPERTIES).getProperty(key);
    if (StringUtils.isNotBlank(result)) {
      return result;
    }
    return loadProperties(target).getProperty(key);
  }

  protected synchronized Properties loadProperties(String target) {
    if (!properties.containsKey(target)) {
      properties.put(target, loadProperties(new ClassPathResource(target)));
    }
    return properties.get(target);
  }

  protected Properties loadProperties(Resource resource) {
    try {
      return PropertiesUtil.readProperties(resource);
    } catch (IOException e) {
      throw new IllegalStateException(
          "Unable to resolve configuration properties: " + resource.getFilename());
    }
  }

  public void setResource(Resource resource) {
    this.resource = resource;
  }
}
