var m;
! function(g) {
    "use strict";

    function e() {}
    e.prototype.init = function() {
        var l = g("#event-modal"),
            t = g("#modal-title"),
            a = g("#form-event"),
            rslt = g("#form-result"),
            i = null,
            r = null,
            s = document.getElementsByClassName("needs-validation"),
            i = null,
            r = null,
            e = new Date,
            n = e.getDate(),
            d = e.getMonth(),
            o = e.getFullYear();
        new FullCalendarInteraction.Draggable(document.getElementById("external-events"), {
            itemSelector: ".external-event",
            eventData: function(e) {
                return {
                    title: e.innerText,
                    className: g(e).data("class")
                }
            }
        });
        var c = [],
            v = (document.getElementById("external-events"), document.getElementById("calendar"));

        function u(e) {
            l.modal("show"), a.removeClass("was-validated"), a[0].reset(), g("#event-title").val(), g("#event-category").val(), g("#event-result").val(), t.text("Add Event"), r = e
        }
        m = new FullCalendar.Calendar(v, {
            plugins: ["bootstrap", "interaction", "dayGrid", "timeGrid"],
            editable: !0,
            droppable: !0,
            selectable: !0,
            defaultView: "dayGridMonth",
            themeSystem: "bootstrap",
            header: {
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth"
            },
            eventClick: function(e) {
                l.modal("show"), a[0].reset(), i = e.event, g("#event-title").val(i.title), g("#event-category").val(i.classNames[0]), g("#event-result").val(i.extendedProps.result), g("#event-btry").val(i.extendedProps.btry), g("#event-hour").val(i.extendedProps.hour), g("#event-minute").val(i.extendedProps.minute), r = null, t.text("Edit Event"), r = null
                console.log(i);
                console.log("seq1" + i.extendedProps.seq);
            },
            dateClick: function(e) {
                u(e)
            },

            events: c
        });
        m.render(), g(a).on("submit", function(e) {
            e.preventDefault();
            g("#form-event :input");
            var t, a = g("#event-title").val(),
                rslt = g('#event-result').val(),
                btry = g("#event-btry").val(),
                n = g("#event-category").val(),
                hour = g("#event-hour").val(),
                minute = g("#event-minute").val();
            !1 === s[0].checkValidity() ? (event.preventDefault(), event.stopPropagation(), s[0].classList.add("was-validated")) : (i ? (i.setProp("title", a), i.setProp("classNames", [n]), i.setProp("extendedProps", {result: rslt, btry: btry, hour: hour, minute:minute, seq: i.extendedProps.seq ? i.extendedProps.seq : null})) : (t = {
                title: a,
                start: r.date,
                allDay: r.allDay,
                result: rslt,
                className: n
            }, m.addEvent(t)), l.modal("hide"))

            
            //점검이력 등록
            registInspecHstry(i.classNames[0], i.extendedProps.btry, i.start, i.extendedProps.result, i.extendedProps.seq, i.extendedProps.hour, i.extendedProps.minute);

        }), g("#btn-delete-event").on("click", function(e) {
            
            // i && (i.remove(), i = null, l.modal("hide"))


            Swal.fire({
                title: "삭제하시겠습니까?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#34c38f",
                cancelButtonColor: "#f46a6a",
                confirmButtonText: "삭제",
                cancelButtonText: "취소"
              }).then(function (result) {
                if (result.value) {
                    deleteInspecHstry(i.extendedProps.seq);
                    i && (i.remove(), i = null, l.modal("hide"));
                    Swal.fire("삭제 완료", "이력이 삭제되었습니다.", "success");
                  
                }
            });

            
        }), g("#btn-new-event").on("click", function(e) {
            u({
                date: new Date,
                allDay: !0
            })
        })
    }, g.CalendarPage = new e, g.CalendarPage.Constructor = e
}(window.jQuery),
function() {
    "use strict";
    window.jQuery.CalendarPage.init()
}();


