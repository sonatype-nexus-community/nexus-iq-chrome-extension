# Message Types

This document catalogues the message types and purposes passed between our UI and Service Worker.

Message types should be named according to the following rules:

-   Domain-oriented
-   Aligned to a CRUD operation

e.g. readComponentDetails; updateExtensionConfiguration; readExtensionConfiguration

## General Message Format

Every message must comply with the following format rules.

### Request Format

```
{
    "type": <MESSAGE_TYPE>,
    "params": {
        <UNBOUND PARAMETERS>
    }
}
```

### Response Format

```
{
    "status": <SUCCESS|AUTH_ERROR|FAILURE|UNKNOWN_ERROR>,
    "status_detail": {
        "message": "A message can go here"
    }
    "data": {
        <UNBOUND RESPONSE DATA>
    }
}
```

## NEW: Messages Received by Service Worker

### Evaluate Component by PURL

**Type:** evaluateComponentByPurl  
**Handled By:** Service Worker
**Parameters:** _None_  
**Response Returned:** Yes  
**Description:** Get a list of Applications that the User has access to in Sonatype IQ Server

Example request:

```
{
    "type": "evaluateComponentByPurl",
    "params": {
        "purl": PURL STRING
    }
}
```

Response (SUCCESS):

```
{
    "status": "SUCCESS",
    "data": [
        componentDetails: ApiComponentEvaluationResultDTOV2
    ]
}
```

### Get Applications

**Type:** getApplications  
**Handled By:** Service Worker
**Parameters:** _None_  
**Response Returned:** Yes  
**Description:** Get a list of Applications that the User has access to in Sonatype IQ Server

Example request:

```
{
    "type": "getApplications"
}
```

Response (SUCCESS):

```
{
    "status": "SUCCESS",
    "data": {
        "applications": [
            ...
        ]
    }
}
```

Response (AUTH_ERROR)

```
{
    "status": "AUTH_ERROR",
    "status_detail": {
        "message": "Unable to authenticate with supplied credentials."
    }
}
```

### Get Component Details

**Type:** getComponentDetails
**Handled By:** N/A
**Parameters:** Yes  
**Response Returned:** Yes  
**Description:** Get detailed information about a Component by PURL.

Example request:

```
{
    "type": "getComponentDetails",
    "params": {
       "purls": [
            // List of PURL strings
        ]
    }
}
```

Response (SUCCESS):

```
{
    "status": "SUCCESS",
    "data": {
        "componentDetails": Array<ApiComponentDetailsDTOV2>
    }
}
```

### Get Component Legal Details

**Type:** getComponentLegalDetails  
**Handled By:** N/A
**Parameters:** Yes  
**Response Returned:** Yes  
**Description:** Get legal information about a Component by PURL.

Example request:

```
{
    "type": "getComponentDetails",
    "params": {
       "purl": // A PURL string
    }
}
```

Response (SUCCESS):

```
{
    "status": "SUCCESS",
    "data": {
        "componentLegalDetails": ApiLicenseLegalComponentReportDTO
    }
}
```

### Get Component Versions

**Type:** getComponentVersions
**Handled By:** N/A
**Parameters:** Yes  
**Response Returned:** Yes  
**Description:** Get an array of all known versions of a Component by PURL.

Example request:

```
{
    "type": "getComponentVersions",
    "params": {
        "purl": <PACKAGE_URL_STRING>
    }
}
```

Response (SUCCESS):

```
{
    "status": "SUCCESS",
    "data": {
        "versions": [
            <list of version numbers>
        ]
    }
}
```

### Get Extension Configuration

**Type:** readExtensionConfiguration
**Handled By:** Content Script  
**Parameters:** _None_  
**Response Returned:** Yes  
**Description:** Get current Extension Configuration from local storage.

Example request:

```
{
    "type": "readExtensionConfiguration"
}
```

Response (SUCCESS):

```
{
    "status": "SUCCESS",
    "data": {
        dataSource: DATA_SOURCE
        host?: string;
        user?: string;
        token?: string;
        iqApplicationId?: string;
        logLevel: string;
    }
}
```

### Get Remediation Details

**Type:** getRemediationDetailsForComponent  
**Handled By:** Content Script  
**Parameters:** ExtensionSettings  
**Response Returned:** Yes  
**Description:** Get Remediation Details for a PURL

Example request:

```
{
    "type": "getRemediationDetailsForComponent",
    "params": {
        "purl": <PACKAGE_URL_STRING>
    }
}
```

Response (SUCCESS):

```
{
    "status": "SUCCESS",
    "data": {
        "remediation": ApiComponentRemediationDTO
    }
}
```

### Propogate Current Component State

**Type:** propogateCurrentComponentState
**Handled By:** Content Script  
**Parameters:** Yes  
**Response Returned:** Yes  
**Description:** Share the fact the state (good/bad) of the current component is known or changed.

Example request:

```
{
    "type": "propogateCurrentComponentState",
    "params": {
        "state": GOOD|BAD|UNKNOWN (ComponentState)
    }
}
```

### Update Extension Configuration

**Type:** updateExtensionConfiguration  
**Handled By:** Content Script  
**Parameters:** ExtensionSettings  
**Response Returned:** Yes  
**Description:** Update current Extension Configuration in local storage and then return current settings

Example request:

```
{
    "type": "updateExtensionConfiguration",
    "params": {
        dataSource: DATA_SOURCE
        host?: string;
        user?: string;
        token?: string;
        iqApplicationId?: string;
        logLevel: string;
    }
}
```

Response (SUCCESS):

```
{
    "status": "SUCCESS",
    "data": {
        dataSource: DATA_SOURCE
        host?: string;
        user?: string;
        token?: string;
        iqApplicationId?: string;
        logLevel: string;
    }
}
```

## NEW: Messages Received by Content

## Existing Messages (to be depracated)

### artifactDetailsFromServiceWorker

**Scope: [chrome.tabs](https://developer.chrome.com/docs/extensions/reference/tabs/)**

### changedURLOnPage

**Scope: [chrome.tabs](https://developer.chrome.com/docs/extensions/reference/tabs/)**

Current Tab URL has changed.

### getArtifactDetailsFromPurl

**Scope: [chrome.runtime](https://developer.chrome.com/docs/extensions/reference/runtime/)**

Obtain detail of a Component by PURL from the configured data source.

### togglePage

**Scope: [chrome.runtime](https://developer.chrome.com/docs/extensions/reference/runtime/)**

Enable or disable this clickable Chrome Extension.

Used when navigating to sites that we do not support - disable ability to attempt lookup (as it will fail).
