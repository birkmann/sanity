module.exports = async function listDatasetCopyJobs(args, context) {
  const {apiClient, output, chalk} = context
  const flags = args.extOptions
  const client = apiClient()
  const projectId = client.config().projectId
  const query = {}
  let response

  if (flags.offset && flags.offset >= 0) {
    query.offset = flags.offset
  }
  if (flags.limit && flags.limit > 0) {
    query.limit = flags.limit
  }

  try {
    response = await client.request({
      method: 'GET',
      uri: `/projects/${projectId}/datasets/copy`,
      query,
    })
  } catch (error) {
    if (error.statusCode) {
      output.print(`${chalk.red(`Dataset copy list failed:\n${error.response.body.message}`)}\n`)
    } else {
      output.print(`${chalk.red(`Dataset copy list failed:\n${error.message}`)}\n`)
    }
  }

  if (response && response.length > 0) {
    output.print('Dataset copy jobs for this project:')
    const print = []

    response.forEach((job) => {
      const {id, state, createdAt, updatedAt, sourceDataset, targetDataset, withHistory} = job

      const createdAtInSeconds = new Date(createdAt).getTime() / 1000
      const nowInSeconds = new Date().getTime() / 1000
      const timePassedInSeconds = nowInSeconds - createdAtInSeconds
      const timeStarted = convertTimestampToDaysHoursMinsSecs(timePassedInSeconds)

      const updatedAtInSeconds = new Date(updatedAt).getTime() / 1000
      const timeTakenInSeconds = updatedAtInSeconds - createdAtInSeconds
      const timeTaken = convertTimestampToDaysHoursMinsSecs(timeTakenInSeconds)

      print.push({
        jobId: id,
        state: state,
        history: withHistory,
        'time started': `${timeStarted} ago`,
        'time taken': timeTaken,
        'source dataset': sourceDataset,
        'target dataset': targetDataset,
      })
    })

    output.printTable(print)
  } else {
    output.print("This project doesn't have any dataset copy jobs")
  }
}

function convertTimestampToDaysHoursMinsSecs(timePassedInSeconds) {
  if (timePassedInSeconds > 0) {
    const d = Math.floor(timePassedInSeconds / (3600 * 24))
    timePassedInSeconds -= d * 3600 * 24
    const h = Math.floor(timePassedInSeconds / 3600)
    timePassedInSeconds -= h * 3600
    const m = Math.floor(timePassedInSeconds / 60)
    timePassedInSeconds -= m * 60
    const s = Math.floor(timePassedInSeconds)

    const days = d > 0 ? d + (d == 1 ? ' day, ' : ' days, ') : ''
    const hours = h > 0 ? h + (h == 1 ? ' hour, ' : ' hours, ') : ''
    const minutes = m > 0 ? m + (m == 1 ? ' minute, ' : ' minutes, ') : ''
    const seconds = s > 0 ? s + (s == 1 ? ' second' : ' seconds') : ''

    return (days + hours + minutes + seconds).replace(/,\s*$/, '')
  }

  return 'not available'
}
