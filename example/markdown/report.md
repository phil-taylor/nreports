# Google GeoCode Report

### Parameters

<table>
    <thead> 
        <th>Name</th> 
        <th>Value</th>          
    </thead> 
    <tbody> 
        {{#each parameters}}
        <tr>
            <td>{{name}}</td>
            <td>{{value}}</td>
        </tr>
        {{/each}}         
    </tbody> 
</table> 

### Address Found

{{#each results.0.address_components}}		
* ({{types}}) - {{long_name}}
{{/each}}

### Geo Location

* (lat/long) - {{results.0.geometry.location.lat}}, {{results.0.geometry.location.lng}}
* (location type) - {{results.0.geometry.location_type}}
