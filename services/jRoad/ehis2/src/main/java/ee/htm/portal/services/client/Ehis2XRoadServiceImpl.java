package ee.htm.portal.services.client;

import com.nortal.jroad.client.exception.XRoadServiceConsumptionException;
import com.nortal.jroad.model.XRoadMessage;
import ee.htm.portal.services.database.Ehis2XRoadDatabaseImpl;
import ee.htm.portal.services.types.eu.x_road.ehis2.GetFileRequestDocument.GetFileRequest;
import ee.htm.portal.services.types.eu.x_road.ehis2.GetFileResponseDocument.GetFileResponse;
import ee.htm.portal.services.types.eu.x_road.ehis2.GetGrantsRequestDocument.GetGrantsRequest;
import ee.htm.portal.services.types.eu.x_road.ehis2.GetGrantsRequestDocument.GetGrantsRequest.Action;
import ee.htm.portal.services.types.eu.x_road.ehis2.GetGrantsRequestDocument.GetGrantsRequest.GrantType;
import ee.htm.portal.services.types.eu.x_road.ehis2.GetGrantsResponseDocument.GetGrantsResponse;
import ee.htm.portal.services.types.eu.x_road.ehis2.PostGrantsRequestDocument.PostGrantsRequest;
import ee.htm.portal.services.types.eu.x_road.ehis2.PostGrantsResponseDocument.PostGrantsResponse;
import org.springframework.stereotype.Service;

@Service("ehis2XRoadService")
public class Ehis2XRoadServiceImpl extends Ehis2XRoadDatabaseImpl implements Ehis2XRoadService {

  @Override
  public GetGrantsResponse getGrants(GetGrantsRequest request, String userId)
      throws XRoadServiceConsumptionException {
    return getGrantsV1(request, userId);
  }

  @Override
  public PostGrantsResponse postGrants(PostGrantsRequest request, String userId)
      throws XRoadServiceConsumptionException {
    return postGrantsV1(request, userId);
  }

  @Override
  public GetFileResponse getFile(GetFileRequest request, String userId)
      throws XRoadServiceConsumptionException {
    return getFileV1(request, userId);
  }

  @Override
  public GetGrantsResponse hasOLTGrantAccess(String personalCode, String userId)
      throws XRoadServiceConsumptionException {
    GetGrantsRequest request = GetGrantsRequest.Factory.newInstance();
    request.setAction(Action.Enum.forString("hasAccessControl"));
    request.setPersonIdCode(personalCode);
    return getGrantsV1(request, userId);
  }

  @Override
  public GetGrantsResponse getGrantWithNumber(String grantNumber, String personalCode,
      String userId) throws XRoadServiceConsumptionException {
    GetGrantsRequest request = GetGrantsRequest.Factory.newInstance();
    request.setAction(Action.Enum.forString("getGrant"));
    request.setPersonIdCode(personalCode);
    request.setGrantNumber(grantNumber);
    return getGrantsV1(request, userId);
  }

  @Override
  public GetGrantsResponse getApplicationData(String grantType, String personalCode, String userId)
      throws XRoadServiceConsumptionException {
    GetGrantsRequest request = GetGrantsRequest.Factory.newInstance();
    request.setAction(Action.Enum.forString("getApplicationData"));
    request.setPersonIdCode(personalCode);
    request.setGrantType(GrantType.Enum.forString(grantType));
    return getGrantsV1(request, userId);
  }

  @Override
  public GetGrantsResponse getGrantsList(String personalCode, String userId)
      throws XRoadServiceConsumptionException {
    GetGrantsRequest request = GetGrantsRequest.Factory.newInstance();
    request.setPersonIdCode(personalCode);
    return getGrantsV1(request, userId);
  }

  @Override
  public PostGrantsResponse postGrants(XRoadMessage<PostGrantsRequest> request, String userId)
      throws XRoadServiceConsumptionException {
    return (PostGrantsResponse) send(request, "postGrants", "v1", userId).getContent();
  }
}
