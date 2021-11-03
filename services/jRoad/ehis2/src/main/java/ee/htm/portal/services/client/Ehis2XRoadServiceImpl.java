package ee.htm.portal.services.client;

import com.nortal.jroad.client.exception.XRoadServiceConsumptionException;
import com.nortal.jroad.client.service.configuration.DelegatingXRoadServiceConfiguration;
import com.nortal.jroad.client.service.configuration.XRoadServiceConfiguration;
import com.nortal.jroad.model.XRoadMessage;
import com.nortal.jroad.model.XmlBeansXRoadMessage;
import ee.htm.portal.services.database.Ehis2XRoadDatabaseImpl;
import ee.htm.portal.services.jroad.service.callback.RepresentationCallback;
import ee.htm.portal.services.types.eu.x_road.ehis2.GetFileRequestDocument.GetFileRequest;
import ee.htm.portal.services.types.eu.x_road.ehis2.GetFileResponseDocument.GetFileResponse;
import ee.htm.portal.services.types.eu.x_road.ehis2.GetGrantsRequestDocument.GetGrantsRequest;
import ee.htm.portal.services.types.eu.x_road.ehis2.GetGrantsRequestDocument.GetGrantsRequest.Action;
import ee.htm.portal.services.types.eu.x_road.ehis2.GetGrantsRequestDocument.GetGrantsRequest.GrantType;
import ee.htm.portal.services.types.eu.x_road.ehis2.GetGrantsResponseDocument.GetGrantsResponse;
import ee.htm.portal.services.types.eu.x_road.ehis2.GetInstitutionsRequestDocument.GetInstitutionsRequest;
import ee.htm.portal.services.types.eu.x_road.ehis2.GetInstitutionsResponseDocument.GetInstitutionsResponse;
import ee.htm.portal.services.types.eu.x_road.ehis2.PostGrantsRequestDocument.PostGrantsRequest;
import ee.htm.portal.services.types.eu.x_road.ehis2.PostGrantsResponseDocument.PostGrantsResponse;
import ee.htm.portal.services.types.eu.x_road.ehis2.PostInstitutionsRequestDocument.PostInstitutionsRequest;
import ee.htm.portal.services.types.eu.x_road.ehis2.PostInstitutionsResponseDocument.PostInstitutionsResponse;
import org.springframework.stereotype.Service;

@Service("ehis2XRoadService")
public class Ehis2XRoadServiceImpl extends Ehis2XRoadDatabaseImpl implements Ehis2XRoadService {

  @Override
  public GetGrantsResponse getGrants(GetGrantsRequest request, String userId)
      throws XRoadServiceConsumptionException {
    if (userId == null || userId.equalsIgnoreCase("-")) {
      return getGrantsV1(request);
    }
    return getGrantsV1(request, userId);
  }

  @Override
  public PostGrantsResponse postGrants(PostGrantsRequest request, String userId)
      throws XRoadServiceConsumptionException {
    if (userId == null || userId.equalsIgnoreCase("-")) {
      return postGrantsV1(request);
    }
    return postGrantsV1(request, userId);
  }

  @Override
  public GetFileResponse getFile(GetFileRequest request, String userId)
      throws XRoadServiceConsumptionException {
    if (userId == null || userId.equalsIgnoreCase("-")) {
      return getFileV1(request);
    }
    return getFileV1(request, userId);
  }

  @Override
  public GetGrantsResponse hasOLTGrantAccess(String personalCode, String userId)
      throws XRoadServiceConsumptionException {
    GetGrantsRequest request = GetGrantsRequest.Factory.newInstance();
    request.setAction(Action.Enum.forString("hasAccessControl"));
    request.setPersonIdCode(personalCode);
    if (userId == null || userId.equalsIgnoreCase("-")) {
      return getGrantsV1(request);
    }
    return getGrantsV1(request, userId);
  }

  @Override
  public GetGrantsResponse getGrantWithNumber(String grantNumber, String personalCode,
      String userId) throws XRoadServiceConsumptionException {
    GetGrantsRequest request = GetGrantsRequest.Factory.newInstance();
    request.setAction(Action.Enum.forString("getGrant"));
    request.setPersonIdCode(personalCode);
    request.setGrantNumber(grantNumber);
    if (userId == null || userId.equalsIgnoreCase("-")) {
      return getGrantsV1(request);
    }
    return getGrantsV1(request, userId);
  }

  @Override
  public GetGrantsResponse getApplicationData(String grantType, String personalCode, String userId)
      throws XRoadServiceConsumptionException {
    GetGrantsRequest request = GetGrantsRequest.Factory.newInstance();
    request.setAction(Action.Enum.forString("getApplicationData"));
    request.setPersonIdCode(personalCode);
    request.setGrantType(GrantType.Enum.forString(grantType));
    if (userId == null || userId.equalsIgnoreCase("-")) {
      return getGrantsV1(request);
    }
    return getGrantsV1(request, userId);
  }

  @Override
  public GetGrantsResponse getGrantsList(String personalCode, String userId)
      throws XRoadServiceConsumptionException {
    GetGrantsRequest request = GetGrantsRequest.Factory.newInstance();
    request.setPersonIdCode(personalCode);
    if (userId == null || userId.equalsIgnoreCase("-")) {
      return getGrantsV1(request);
    }
    return getGrantsV1(request, userId);
  }

  @Override
  public PostGrantsResponse postGrants(XRoadMessage<PostGrantsRequest> request, String userId)
      throws XRoadServiceConsumptionException {
    if (userId == null || userId.equalsIgnoreCase("-")) {
      return (PostGrantsResponse) send(request, "postGrants", "v1").getContent();
    }
    return (PostGrantsResponse) send(request, "postGrants", "v1", userId).getContent();
  }

  @Override
  public GetInstitutionsResponse getInstitutions(GetInstitutionsRequest request, String userId)
          throws XRoadServiceConsumptionException {
    if (userId == null || userId.equalsIgnoreCase("-")) {
      return getInstitutionsV1(request);
    }
    return getInstitutionsV1(request, userId);
  }

  @Override
  public GetInstitutionsResponse getInstitutions(GetInstitutionsRequest request, String userId,
                                                 String partyClass, String partyCode) throws XRoadServiceConsumptionException {
    XRoadServiceConfiguration xRoadConfiguration = getXRoadServiceConfigurationProvider().createConfiguration(getDatabase(), getDatabase(), "getInstitutions", "v1");
    DelegatingXRoadServiceConfiguration configuration = new DelegatingXRoadServiceConfiguration(xRoadConfiguration) {
      private static final long serialVersionUID = 1L;

      public String getIdCode() {
        return userId != null ? userId : super.getIdCode();
      }
    };
    XRoadMessage<GetInstitutionsResponse> response = xRoadConsumer.sendRequest(new XmlBeansXRoadMessage<GetInstitutionsRequest>(request), configuration, new RepresentationCallback(partyClass, partyCode), null);
    return response.getContent();
  }

  @Override
  public PostInstitutionsResponse postInstitutions(XRoadMessage<PostInstitutionsRequest> request, String userId)
          throws XRoadServiceConsumptionException {
    if (userId == null || userId.equalsIgnoreCase("-")) {
      return (PostInstitutionsResponse) send(request, "postInstitutions", "v1").getContent();
    }
    return (PostInstitutionsResponse) send(request, "postInstitutions", "v1", userId).getContent();
  }

  @Override
  public PostInstitutionsResponse postInstitutions(XRoadMessage<PostInstitutionsRequest> request, String userId,
                                                   String partyClass, String partyCode) throws XRoadServiceConsumptionException {
    XRoadServiceConfiguration xRoadConfiguration = getXRoadServiceConfigurationProvider().createConfiguration(getDatabase(), getDatabase(), "postInstitutions", "v1");
    DelegatingXRoadServiceConfiguration configuration = new DelegatingXRoadServiceConfiguration(xRoadConfiguration) {
      private static final long serialVersionUID = 1L;

      public String getIdCode() {
        return userId != null ? userId : super.getIdCode();
      }
    };
    XRoadMessage<PostInstitutionsResponse> response = xRoadConsumer.sendRequest(request, configuration, new RepresentationCallback(partyClass, partyCode), null);
    return response.getContent();
  }

  @Override
  public GetInstitutionsResponse getMtsysKlf() throws XRoadServiceConsumptionException {
    GetInstitutionsRequest request = GetInstitutionsRequest.Factory.newInstance();
    request.setEducationalInstitutionUid("0");
    request.setAction(GetInstitutionsRequest.Action.GET_MTSYS_CLASSIFIERS);
    return getInstitutionsV1(request);
  }
}
