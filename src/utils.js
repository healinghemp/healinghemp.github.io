export const formatPrice = (price) => {
	var p;
	price = (price / 100).toFixed(2);
	p = price.toString();
	if (p[p.length - 2] == '.') {
		p += "0";
	}
	else if (p[p.length - 3] != '.') {
		p += ".00";
	}
	return p;
}

export const formatDate = (date) => {
	let d = new Date(date);
	return (1 + d.getMonth()) + "/" + d.getDate() + ", " + displayTime(d);
}

export const displayTime = (date) => {
	var minutes = date.getMinutes();
	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	return simplifyTime(date.getHours() + ":" + minutes);
};

export const simplifyTime = (time) => {
	var hours = Number(time.slice(0, 2));
	if (hours >= 12) {
		if (hours !== 12) {
			hours = hours % 12;
		}
		time = time + " pm";
		time = hours.toString() + time.substr(2);
	}
	else {
		if (hours < 10) {
			if (hours === 0) {
				time = "12" + time.substr(2);
			}
			else time = time.substr(1);
		}
		time = time + " am";
	}
	return time;
}