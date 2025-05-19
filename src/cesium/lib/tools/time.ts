export function dateTimeFormatter(datetime, viewModel, ignoredate) {
    const julianDT = new Cesium.JulianDate();
    Cesium.JulianDate.addHours(datetime, 8, julianDT);
    const gregorianDT = Cesium.JulianDate.toGregorianDate(julianDT);
    let objDT;
    if (ignoredate) objDT = '';
    else {
        objDT = new Date(gregorianDT.year, gregorianDT.month - 1, gregorianDT.day);
        objDT = `${gregorianDT.year}年${objDT.toLocaleString('zh-cn', { month: 'short' })}${
            gregorianDT.day
        }日`;
        if (viewModel || gregorianDT.hour + gregorianDT.minute === 0) return objDT;
        objDT += ' ';
    }
    return (
        objDT +
        Cesium.sprintf('%02d:%02d:%02d', gregorianDT.hour, gregorianDT.minute, gregorianDT.second)
    );
}
