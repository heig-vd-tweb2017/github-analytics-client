/* eslint no-undef: "error" */
/* global LineChart BarChart Table oboe */

$(() => {
  // Create all the objects
  const allIssuesGraph = new LineChart('total-issues-chart', [], [], []);
  const allIssuesTable = new Table('total-issues-table', ['Date', '# issues opened', '# issues closed'], []);

  const openedIssuesGraph = new BarChart('opened-issues-chart', [], []);
  const openedIssuesTable = new Table('opened-issues-table', ['User', '# issues opened'], []);

  const closedIssuesGraph = new BarChart('closed-issues-chart', [], []);
  const closedIssuesTable = new Table('closed-issues-table', ['User', '# issues closed'], []);

  // Define the API's URL
  const url = 'http://localhost:5050'; // 'https://evening-garden-52901.herokuapp.com';

  $('#search-button').click(() => {
    // Reset the graphs and tables
    allIssuesGraph.reset();
    allIssuesTable.reset();

    openedIssuesGraph.reset();
    openedIssuesTable.reset();

    closedIssuesGraph.reset();
    closedIssuesTable.reset();

    // Get the informations from the repository
    const input = $('#search-input').val();

    const request = input.replace('https', 'http').replace('http://github.com/', '');

    const infos = request.split('/');

    const owner = infos[0];
    const repo = infos[1];

    const tableTotalRows = new Map();

    // Get opened issues
    oboe(`${url}/api/opened-issues/${owner}/${repo}`)
      .node('dates', (element) => {
        const dates = new Map(element);

        const datesLabels = Array.from(dates.keys());
        const datesData = [];

        dates.forEach((value, key) => {
          datesData.push({
            x: `new newDateString(${key})`,
            y: value,
          });
          if (!tableTotalRows.has(key)) {
            tableTotalRows.set(key, [key, value, 0]);
          } else {
            tableTotalRows.set(key, [key, value, tableTotalRows.get(key)[2]]);
          }
        });

        allIssuesGraph.updateOpenedIssues(datesLabels, datesData);
        allIssuesTable.setBody(Array.from(tableTotalRows.values()));
      })
      .node('users', (element) => {
        const users = new Map(element);

        const usersTableRows = Array.from(users).sort((a, b) => b[1] - a[1]);
        
        const bestUser = ['no one', 'no one', 'no one'];
        const bestIssues = [0, 0, 0];
        const size = usersTableRows.length;
        const max = Math.min(15, size);
        
        if (size > 0) {
          bestUser[0] = usersTableRows[1][0];
          bestIssues[0] = usersTableRows[1][1];
        }
        if (size > 1) {
          bestUser[1] = usersTableRows[0][0];
          bestIssues[1] = usersTableRows[0][1];
        }
        if (size > 2) {
          bestUser[2] = usersTableRows[2][0];
          bestIssues[2] = usersTableRows[2][1];
        }

        openedIssuesGraph.update(bestUser, bestIssues);
        openedIssuesTable.setBody(usersTableRows.slice(0, max));
      });

    // Get closed issues
    oboe(`${url}/api/closed-issues/${owner}/${repo}`)
      .node('dates', (element) => {
        const dates = new Map(element);

        const datesLabels = Array.from(dates.keys());
        const datesData = [];

        dates.forEach((value, key) => {
          datesData.push({
            x: `new newDateString(${key})`,
            y: value,
          });
          if (!tableTotalRows.has(key)) {
            tableTotalRows.set(key, [key, 0, value]);
          } else {
            tableTotalRows.set(key, [key, tableTotalRows.get(key)[1], value]);
          }
        });

        allIssuesGraph.updateClosedIssues(datesLabels, datesData);
        allIssuesTable.setBody(Array.from(tableTotalRows.values()));
      })
      .node('users', (element) => {
        const users = new Map(element);

        const usersTableRows = Array.from(users).sort((a, b) => b[1] - a[1]);

        const bestUser = ['no one', 'no one', 'no one'];
        const bestIssues = [0, 0, 0];
        const size = usersTableRows.length;
        const max = Math.min(15, size);
       
        
        if (size > 0) {
          bestUser[0] = usersTableRows[1][0];
          bestIssues[0] = usersTableRows[1][1];
        }
        if (size > 1) {
          bestUser[1] = usersTableRows[0][0];
          bestIssues[1] = usersTableRows[0][1];
        }
        if (size > 2) {
          bestUser[2] = usersTableRows[2][0];
          bestIssues[2] = usersTableRows[2][1];
        }

        closedIssuesGraph.update(bestUser, bestIssues);
        closedIssuesTable.setBody(usersTableRows.slice(0, max));
      });
  });
});
