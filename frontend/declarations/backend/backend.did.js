export const idlFactory = ({ IDL }) => {
  const Result_1 = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const Time = IDL.Int;
  const File = IDL.Record({
    'content' : IDL.Vec(IDL.Nat8),
    'thumbnailUrl' : IDL.Opt(IDL.Text),
    'name' : IDL.Text,
    'size' : IDL.Nat,
    'uploadTime' : Time,
  });
  const Result = IDL.Variant({ 'ok' : File, 'err' : IDL.Text });
  return IDL.Service({
    'deleteFile' : IDL.Func([IDL.Text], [Result_1], []),
    'listFiles' : IDL.Func([], [IDL.Vec(File)], []),
    'uploadFile' : IDL.Func(
        [IDL.Text, IDL.Vec(IDL.Nat8), IDL.Opt(IDL.Text)],
        [Result],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
