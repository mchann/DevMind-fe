<script lang="ts">
  export let text: string = "DEVMIND";
  
  // 5x7 font dictionary
  const font: Record<string, number[][]> = {
    'D': [
      [1,1,1,1,0],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,1,1,1,0]
    ],
    'E': [
      [1,1,1,1,1],
      [1,0,0,0,0],
      [1,0,0,0,0],
      [1,1,1,1,0],
      [1,0,0,0,0],
      [1,0,0,0,0],
      [1,1,1,1,1]
    ],
    'V': [
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [0,1,0,1,0],
      [0,0,1,0,0]
    ],
    'M': [
      [1,0,0,0,1],
      [1,1,0,1,1],
      [1,0,1,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1]
    ],
    'I': [
      [1,1,1,1,1],
      [0,0,1,0,0],
      [0,0,1,0,0],
      [0,0,1,0,0],
      [0,0,1,0,0],
      [0,0,1,0,0],
      [1,1,1,1,1]
    ],
    'N': [
      [1,0,0,0,1],
      [1,1,0,0,1],
      [1,0,1,0,1],
      [1,0,0,1,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1]
    ],
    ' ': [
      [0,0,0],
      [0,0,0],
      [0,0,0],
      [0,0,0],
      [0,0,0],
      [0,0,0],
      [0,0,0]
    ]
  };

  // Build a complete 2D array (7 rows) containing the concatenated characters
  $: rows = (() => {
    let combined: number[][] = [[], [], [], [], [], [], []];
    const upperText = text.toUpperCase();
    for (let i = 0; i < upperText.length; i++) {
      const char = upperText[i];
      const charGrid = font[char] || font[' '];
      for (let r = 0; r < 7; r++) {
        combined[r] = combined[r].concat(charGrid[r]);
        // Add 1 column gap between letters, unless it's the last letter
        if (i < upperText.length - 1) {
          combined[r].push(0);
        }
      }
    }
    return combined;
  })();

</script>

<div class="pixel-text-container w-full overflow-hidden flex justify-center py-10 bg-[#0A0A0A]">
  <div class="flex flex-col gap-[2px]">
    {#each rows as row}
      <div class="flex gap-[2px]">
        {#each row as cell}
          <div class="pixel-cell {cell ? 'filled' : 'empty'}"></div>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style>
  .pixel-cell {
    /* Set fixed width and height per cell. 
       Adjust based on desired size. */
    width: 2.5vw;
    height: 2.5vw;
    max-width: 32px;
    max-height: 32px;
    min-width: 12px;
    min-height: 12px;
    transition: all 0.2s ease;
  }

  /* When cell is 1 (filled) */
  .filled {
    background-color: white;
    border: 1px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 0 5px rgba(255, 255, 255, 0.2);
  }

  /* When cell is 0 (empty) */
  .empty {
    background-color: transparent;
    /* faint border for grid effect like in the reference image */
    border: 1px solid rgba(255, 255, 255, 0.1); 
  }

  /* Optional hover effect */
  .pixel-cell:hover {
    background-color: var(--accent-yellow, #ffd500);
    border-color: var(--accent-yellow, #ffd500);
    box-shadow: 0 0 10px var(--accent-yellow, #ffd500);
    transform: scale(1.1);
    z-index: 10;
  }
</style>
