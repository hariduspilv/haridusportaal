package ee.htm.portal.services.jroad.service.callback;

import com.nortal.jroad.client.service.callback.CustomCallback;
import org.apache.commons.lang.StringUtils;
import org.springframework.ws.WebServiceMessage;
import org.springframework.ws.soap.saaj.SaajSoapMessage;

import javax.xml.soap.*;
import javax.xml.transform.TransformerException;
import java.io.IOException;

public class RepresentationCallback extends CustomCallback {

    private String partyClass;
    private String partyCode;

    public RepresentationCallback(String partyClass, String partyCode) {
        this.partyClass = partyClass;
        this.partyCode = partyCode;
    }

    @Override
    public void doWithMessage(WebServiceMessage request) throws IOException, TransformerException {
        callback.doWithMessage(request);
        SaajSoapMessage message = (SaajSoapMessage) request;
        SOAPMessage mes = message.getSaajMessage();
        try {
            SOAPEnvelope env = mes.getSOAPPart().getEnvelope();
            env.addNamespaceDeclaration("rep", "http://x-road.eu/xsd/representation.xsd");

            SOAPHeader header = env.getHeader();
            SOAPElement representedElement = header.addChildElement("representedParty", "rep");
            if (StringUtils.isNotBlank(partyClass)) {
                SOAPElement partyClassElement = representedElement.addChildElement("partyClass", "rep");
                partyClassElement.addTextNode(partyClass);
            }
            SOAPElement partyCodeElement = representedElement.addChildElement("partyCode", "rep");
            partyCodeElement.addTextNode(partyCode);
        } catch (SOAPException e) {
            throw new RuntimeException(e);
        }
    }
}
