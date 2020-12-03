package ee.htm.portal.services.client;

import com.nortal.jroad.client.exception.XRoadServiceConsumptionException;
import com.nortal.jroad.model.XRoadMessage;
import ee.htm.portal.services.types.eu.x_road.ehis2.GetFileRequestDocument.GetFileRequest;
import ee.htm.portal.services.types.eu.x_road.ehis2.GetFileResponseDocument.GetFileResponse;
import ee.htm.portal.services.types.eu.x_road.ehis2.GetGrantsRequestDocument.GetGrantsRequest;
import ee.htm.portal.services.types.eu.x_road.ehis2.GetGrantsResponseDocument.GetGrantsResponse;
import ee.htm.portal.services.types.eu.x_road.ehis2.PostGrantsRequestDocument.PostGrantsRequest;
import ee.htm.portal.services.types.eu.x_road.ehis2.PostGrantsResponseDocument.PostGrantsResponse;

public interface Ehis2XRoadService {

  GetGrantsResponse hasOLTGrantAccess(String personalCode, String userId)
      throws XRoadServiceConsumptionException;

  GetGrantsResponse getGrantWithNumber(String grantNumber, String personalCode, String userId)
      throws XRoadServiceConsumptionException;

  GetGrantsResponse getApplicationData(String grantType, String personalCode, String userId)
      throws XRoadServiceConsumptionException;

  GetGrantsResponse getGrantsList(String personalCode, String userId)
      throws XRoadServiceConsumptionException;

  GetGrantsResponse getGrants(GetGrantsRequest request, String userId)
      throws XRoadServiceConsumptionException;

  PostGrantsResponse postGrants(PostGrantsRequest request, String userId)
      throws XRoadServiceConsumptionException;

  GetFileResponse getFile(GetFileRequest request, String userId)
      throws XRoadServiceConsumptionException;

  PostGrantsResponse postGrants(XRoadMessage<PostGrantsRequest> request, String userId)
      throws XRoadServiceConsumptionException;
}
