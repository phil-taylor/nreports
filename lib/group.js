function ReportGroup(fields, header, detail, footer, subgroups){
	this.fields = fields;
	this.header = header;
	this.detail = detail;
	this.footer = footer;
	this.subgroups = subgroups;
}

ReportGroup.prototype = {

	addSubgroup: function(fields, header, detail, footer) {
		this.subgroups.push(new ReportGroup(fields, header, detail, footer));
	}

}