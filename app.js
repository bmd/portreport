/**
 * Fetch a list of ports from github and stash them in localstorage. If we've
 * already retrieved the ports, go straight to localstorage.
 *
 * @returns {Object}
 */
const loadPorts = async () => {
  let ports = JSON.parse(decodeURIComponent(localStorage.getItem('ports')))

  if (!ports) {
    ports = await fetch('https://raw.githubusercontent.com/mephux/ports.json/master/ports.lists.json')
      .then(r => r.json())

    localStorage.setItem('ports', JSON.stringify(ports))
  }

  return ports
}

/**
 * Display an additional alert when a new port is queried.
 *
 * @param {string} type The bootstrap alert type to style the notification
 * @param {string} message
 * @returns {void}
 */
const showResult = (type, message) => {
  $('#results').prepend(`
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
      ${message}
    </div>
  `)
}

/**
 * @returns {void}
 */
const trimResults = () => {
  if ($('#results').children().length > 10) {
    $('#results div:last-child').remove()
  }
}

function searchPort (ports) {
  portValue = $('#example-search-input').val()
  portNumeric = parseInt(portValue)
  if (!Number.isInteger(portNumeric) || portNumeric < 0 || portNumeric > 65535) {
    showResult('danger', `<strong>${portValue}</strong> is not valid TCP/UDP port`)
  } else {
    if (!ports[portValue]) {
      showResult('success',
        `<strong>All clear!</strong> It looks like nobody is using port <strong>${portValue}</strong>...yet`)
    } else {
      if (ports[portValue].length > 1) {
        let msg = `Port <strong>${portValue}</strong> is:<ul>`
        for (let port of ports[portValue]) {
          const type = [
            (port.tcp) ? '<strong>TCP</strong>' : null,
            (port.udp) ? '<strong>UDP</strong>' : null
          ].filter(x => x).join(' and ')
          const official = (port.status === 'Unofficial') ? 'Unofficially' : 'Officially'

          msg += `<li><strong>${official}</strong> used by <strong>${port.description}</strong> for ${type} traffic</li>`
        }

        msg += `</ul>`
        showResult('warning', msg)
      } else {
        const p = ports[portValue][0]
        const type = [(p.tcp) ? '<strong>TCP</strong>' : null, (p.udp) ? '<strong>UDP</strong>' : null].filter(
          x => x).join(' and ')
        const official = (p.status === 'Unofficial') ? 'unofficially' : 'officially'
        showResult('warning',
          `Port <strong>${portValue}</strong> is <strong>${official}</strong> used by <strong>${p.description}</strong> for ${type} traffic`)
      }
    }
  }

  trimResults()
}

$(function () {
  loadPorts().then(ports => {
    $('.form-control').on('keypress', function (e) {
      if (e.which == '13') {
        searchPort(ports)
      }
    })
  })
})