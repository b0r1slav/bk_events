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

        function appendElToEvent(parent, $el) {
            if ($(parent).find('.fc-list-event-title').length) {
                $(parent).find('.fc-list-event-title').append($el);
            } else {
                $(parent).append($el);
            }
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
                                    const $badge = $('<span></span>').addClass('badge ms-2')
                                        .text(info.event.extendedProps.nutrient)
                                        .css('backgroundColor', info.event.extendedProps.nutrientColor);
                                    
                                    appendElToEvent(info.el, $badge);
                                }

                                if (info.event.extendedProps.quantity) {
                                    const $quantity = $('<span></span>').addClass('ms-2 fw-bold')
                                        .text(info.event.extendedProps.quantity);
                                    
                                    appendElToEvent(info.el, $quantity);
                                }

                                if (info.event.extendedProps.comment) {
                                    const $comment = $('<span></span>').addClass('ms-2 fst-italic')
                                        .text(info.event.extendedProps.comment);

                                    appendElToEvent(info.el, $comment);
                                }

                                const twinName = info.event.extendedProps.twinName.toLowerCase();
                                if ($twinFilter.val() && twinName !== $twinFilter.val().toLowerCase()) {
                                    info.el.style.display = 'none';
                                }

                                const typeFilter = Array.isArray($typeFilter.val()) ? $typeFilter.val() : [];
                                const typeFilterValues = typeFilter.map(el => el.toLowerCase());
                                const type = info.event.extendedProps.type.toLowerCase();

                                if (typeFilterValues.length) {
                                    if (!typeFilterValues.includes(type) && !(typeFilterValues.includes("нутриенти") && info.event.extendedProps.nutrient)) {
                                        info.el.style.display = 'none';
                                    }
                                }
                            }
                        });
                        calendar.render();
                    }
                })
                .catch(error => console.log('error', error));
        }

        loadEvents();

        $twinFilter.add($typeFilter).on('change', function (e) {
            calendar.refetchEvents();

            if (e.currentTarget.id === "type-filter") {
                $('#type-filter-selected').empty();
                ($(e.currentTarget).val() || []).forEach((v) => {
                    $('<button type="button" class="btn btn-outline-dark btn-sm me-1 tf-selection"></button>').text(v).val(v).appendTo('#type-filter-selected');
                });
            }
        });

        $('#type-filter-selected').on('click', '.tf-selection', function (e) {
            const $tf = $('#type-filter');
            const val = $tf.val();
            const clicked = e.currentTarget.value;
            const fVal = (val || []).filter(v => v !== clicked);
            
            $tf.val(fVal).trigger('change');
        });
    });
})();