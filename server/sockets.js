function sockets(io, socket, data) {
  socket.emit('init', data.getUILabels());
  
  socket.on('pageLoaded', function (lang) {
    socket.emit('init', data.getUILabels(lang));
  });

  socket.on('switchLanguage', function(lang) {
    socket.emit('init', data.getUILabels(lang));
  });

  socket.on('createPoll', function(d) {
    socket.emit('pollCreated', data.createPoll(d.gameId, d.lang));
  });

  socket.on('addQuestion', function(d) {
    data.addQuestion(d.gameId, {q: d.q, a: d.a});
    socket.emit('dataUpdate', data.getAnswers(d.gameId));
  });

  socket.on('editQuestion', function(d) {
    data.editQuestion(d.gameId, d.index, {q: d.q, a: d.a});
    socket.emit('questionEdited', data.getAllQuestions(d.gameId));
  });

  socket.on('joinPoll', function(gameId) {
    socket.join(gameId);
    socket.emit('newQuestion', data.getQuestion(gameId))
    socket.emit('dataUpdate', data.getAnswers(gameId));
  });

  socket.on('runQuestion', function(d) {
    io.to(d.gameId).emit('newQuestion', data.getQuestion(d.gameId, d.questionNumber));
    io.to(d.gameId).emit('dataUpdate', data.getAnswers(d.gameId));
  });

  socket.on('submitAnswer', function(d) {
    data.submitAnswer(d.gameId, d.answer);
    io.to(d.gameId).emit('dataUpdate', data.getAnswers(d.gameId));
  });

  socket.on('resetAll', () => {
    data = new Data();
    data.initializeData();
  })
 
}

export { sockets };