(function () {
    document.addEventListener('DOMContentLoaded', function () {
        const $twinFilter = $("#twin-filter");
        const $typeFilter = $("#type-filter");
        let calendar = {};

        function populateTypeFilter(types = []) {
            types.forEach((t) => {
                $('<option></option>').val(t.name).text(t.name).appendTo($typeFilter);
            });
        }

        function loadEvents() {
            var requestOptions = {
                method: 'GET',
                redirect: 'follow'
            };

            fetch("https://script.google.com/macros/s/AKfycbxNnO6euZTMq_q8EM4k0bvYsO2QTCDZ3yGevR0eSkWCmoTrfsbdEQlPViNxIDH9GY-Ctw/exec", requestOptions)
                .then(response => response.json())
                .then((result) => {
                    if (result?.success) {
                        populateTypeFilter(result.types);

                        const calendarEl = document.getElementById('calendar');
                        calendar = new FullCalendar.Calendar(calendarEl, {
                            initialView: 'listDay',
                            locale: "bg-BG",
                            height: "auto",
                            headerToolbar: {
                                left: 'prev,next',
                                center: 'title',
                                right: 'listDay,dayGridWeek,listWeek,dayGridMonth'
                            },
                            buttonText: {
                                listDay: 'Днес лист',
                                listWeek: 'Седмица лист',
                                dayGridWeek: 'Седмица',
                                dayGridMonth: 'Месец',
                            },
                            eventTimeFormat: {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            },
                            events: function (fetchInfo, successCallback, failureCallback) {
                                successCallback(result.events);
                            },
                            eventDidMount: function (info) {
                                if (info.backgroundColor) {
                                    info.el.style.background = info.backgroundColor;
                                }

                                if (info.event.extendedProps.nutrient) {
                                    const $span = $('<span></span>').addClass('badge')
                                        .text(info.event.extendedProps.nutrient)
                                        .css('backgroundColor', info.event.extendedProps.nutrientColor);
                                    
                                    if ($(info.el).find('.fc-list-event-title').length) {
                                        $(info.el).find('.fc-list-event-title').append($span);
                                    } else {
                                        $(info.el).append($span);
                                    }
                                }

                                const twinName = info.event.extendedProps.twinName.toLowerCase();
                                if ($twinFilter.val() && twinName !== $twinFilter.val().toLowerCase()) {
                                    info.el.style.display = 'none';
                                }

                                const typeFilter = Array.isArray($typeFilter.val()) ? $typeFilter.val() : [];
                                const typeFilterValues = typeFilter.map(el => el.toLowerCase());
                                const type = info.event.extendedProps.type.toLowerCase();

                                if (typeFilterValues.length && !typeFilterValues.includes(type)) {
                                    info.el.style.display = 'none';
                                }
                            }
                        });
                        calendar.render();
                    }
                })
                .catch(error => console.log('error', error));
        }

        loadEvents();

        $twinFilter.select2({
            placeholder: "Филтрирай по хитрец",
            allowClear: true
        });

        $typeFilter.select2({
            placeholder: "Филтрирай по тип на събитие",
            allowClear: true
        });

        $twinFilter.add($typeFilter).on('change', function () {
            calendar.refetchEvents();
        });
    });
})();