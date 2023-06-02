# Message Types

This document catalogues the message types and purposes passed between our UI and Service Worker.

Message types should be named according to the following rules:
- Domain-oriented 
- Aligned to a CRUD operation
  
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

### Get Applications

**Type:** getApplications  
**Parameters:** *None*  
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

### Get Extension Configuration

**Type:** getExtensionConfiguration  
**Parameters:** *None*  
**Response Returned:** Yes  
**Description:** Get current Extension Configuration from local storage.  

Example request:
```
{
    "type": "getConfiguration"
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

### Update Extension Configuration

**Type:** updateExtensionConfiguration  
**Parameters:** *None*  
**Response Returned:** No  
**Description:** Update current Extension Configuration in local storage.  

Example request:
```
{
    "type": "updateConfiguration",
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