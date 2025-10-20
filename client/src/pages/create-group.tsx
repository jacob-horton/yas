import { useNavigate } from '@solidjs/router';
import { createSignal } from 'solid-js';
import { api } from '../api';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { Page } from '../components/page';

export const CreateGroup = () => {
  const navigate = useNavigate();
  const [name, setName] = createSignal('');

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const res = await api.post('/groups', { name: name() });
    console.log(res);

    navigate(`/groups/${res.data.id}`);
  }

  return (
    <Page title="Create Group">
      <form class="flex flex-col gap-6" onSubmit={handleSubmit}>
        <Input
          label="Name"
          value={name()}
          onChange={setName}
          placeholder="e.g. Mario Kart Wii"
        />
        <span class="flex gap-4">
          <Button type="submit">Create</Button>
          <Button variant="secondary">Cancel</Button>
        </span>
      </form>
    </Page>
  );
};
